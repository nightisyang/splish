const Database = require('better-sqlite3');
const slugify = require('slugify');
const config = require('../config');

let db = null;

/**
 * Get or initialize the database connection
 */
function getDb() {
  if (!db) {
    db = new Database(config.paths.database);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

/**
 * Close the database connection
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Get all existing URLs as a Set for quick lookup
 * @returns {Set<string>} Set of URLs
 */
function getExistingUrls() {
  const database = getDb();
  const stmt = database.prepare('SELECT url FROM waterfalls WHERE deleted = 0');
  const rows = stmt.all();
  return new Set(rows.map(row => row.url).filter(Boolean));
}

/**
 * Find a waterfall by URL
 * @param {string} url - The waterfall URL
 * @returns {Object|null} Waterfall data or null
 */
function findByUrl(url) {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM waterfalls WHERE url = ?');
  return stmt.get(url) || null;
}

/**
 * Insert a new waterfall or update existing one by URL
 * @param {Object} data - Waterfall data
 * @returns {Object} Result with action taken
 */
function upsertWaterfall(data) {
  const database = getDb();
  const existing = findByUrl(data.url);

  // Generate slug
  const slug = slugify(data.name, { lower: true });

  // Extract coordinates
  let lng = null;
  let lat = null;
  if (data.location && data.location.coordinates) {
    [lng, lat] = data.location.coordinates;
  }

  if (existing) {
    // Update existing record
    const stmt = database.prepare(`
      UPDATE waterfalls SET
        name = ?,
        slug = ?,
        description = ?,
        state = ?,
        location_lng = ?,
        location_lat = ?,
        water_source = ?,
        waterfall_profile = ?,
        accessibility = ?,
        img_details = ?,
        last_scraped = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP,
        deleted = 0
      WHERE url = ?
    `);

    stmt.run(
      data.name,
      slug,
      data.description,
      data.state,
      lng,
      lat,
      data.waterSource || null,
      data.waterfallProfile || null,
      data.accessibility || null,
      data.imgDetails ? JSON.stringify(data.imgDetails) : null,
      data.url
    );

    return { action: 'updated', id: existing.id, url: data.url };
  } else {
    // Insert new record
    const stmt = database.prepare(`
      INSERT INTO waterfalls (
        name, slug, description, state, location_type, location_lng, location_lat,
        water_source, waterfall_profile, accessibility, img_details, url,
        last_scraped, deleted
      ) VALUES (?, ?, ?, ?, 'Point', ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0)
    `);

    const result = stmt.run(
      data.name,
      slug,
      data.description,
      data.state,
      lng,
      lat,
      data.waterSource || null,
      data.waterfallProfile || null,
      data.accessibility || null,
      data.imgDetails ? JSON.stringify(data.imgDetails) : null,
      data.url
    );

    return { action: 'inserted', id: result.lastInsertRowid, url: data.url };
  }
}

/**
 * Update the last_scraped timestamp for a waterfall
 * @param {number} id - Waterfall ID
 */
function updateLastScraped(id) {
  const database = getDb();
  const stmt = database.prepare('UPDATE waterfalls SET last_scraped = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(id);
}

/**
 * Mark a waterfall as deleted (soft delete)
 * @param {string} url - The waterfall URL
 */
function markAsDeleted(url) {
  const database = getDb();
  const stmt = database.prepare('UPDATE waterfalls SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE url = ?');
  stmt.run(url);
}

/**
 * Get all waterfalls (optionally including deleted)
 * @param {boolean} includeDeleted - Whether to include deleted waterfalls
 * @returns {Array} Array of waterfalls
 */
function getAllWaterfalls(includeDeleted = false) {
  const database = getDb();
  const sql = includeDeleted
    ? 'SELECT * FROM waterfalls ORDER BY name'
    : 'SELECT * FROM waterfalls WHERE deleted = 0 ORDER BY name';
  const stmt = database.prepare(sql);
  return stmt.all();
}

/**
 * Get waterfalls by state
 * @param {string} state - State name
 * @returns {Array} Array of waterfalls
 */
function getByState(state) {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM waterfalls WHERE state = ? AND deleted = 0 ORDER BY name');
  return stmt.all(state);
}

/**
 * Get sync statistics
 * @returns {Object} Statistics object
 */
function getStats() {
  const database = getDb();

  const total = database.prepare('SELECT COUNT(*) as count FROM waterfalls WHERE deleted = 0').get();
  const deleted = database.prepare('SELECT COUNT(*) as count FROM waterfalls WHERE deleted = 1').get();
  const byState = database.prepare(`
    SELECT state, COUNT(*) as count
    FROM waterfalls
    WHERE deleted = 0
    GROUP BY state
    ORDER BY state
  `).all();

  return {
    total: total.count,
    deleted: deleted.count,
    byState: byState.reduce((acc, row) => {
      acc[row.state] = row.count;
      return acc;
    }, {})
  };
}

/**
 * Check if a waterfall has changes compared to new data
 * @param {Object} existing - Existing database row
 * @param {Object} newData - New scraped data
 * @returns {boolean} True if there are changes
 */
function hasChanges(existing, newData) {
  if (!existing) return true;

  // Compare key fields
  if (existing.name !== newData.name) return true;
  if (existing.description !== newData.description) return true;
  if (existing.state !== newData.state) return true;
  if (existing.water_source !== (newData.waterSource || null)) return true;
  if (existing.waterfall_profile !== (newData.waterfallProfile || null)) return true;
  if (existing.accessibility !== (newData.accessibility || null)) return true;

  // Compare coordinates
  if (newData.location && newData.location.coordinates) {
    const [lng, lat] = newData.location.coordinates;
    if (existing.location_lng !== lng || existing.location_lat !== lat) return true;
  }

  // Compare image details
  const existingImgDetails = existing.img_details ? JSON.stringify(JSON.parse(existing.img_details)) : null;
  const newImgDetails = newData.imgDetails ? JSON.stringify(newData.imgDetails) : null;
  if (existingImgDetails !== newImgDetails) return true;

  return false;
}

module.exports = {
  getDb,
  closeDatabase,
  getExistingUrls,
  findByUrl,
  upsertWaterfall,
  updateLastScraped,
  markAsDeleted,
  getAllWaterfalls,
  getByState,
  getStats,
  hasChanges
};
