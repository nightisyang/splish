const Database = require('better-sqlite3');
const path = require('path');
const slugify = require('slugify');

const DB_PATH = path.join(__dirname, 'waterfalls.db');

let db = null;

/**
 * Haversine formula to calculate distance between two points
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function geoDistance(lat1, lon1, lat2, lon2) {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

/**
 * Initialize the SQLite database and create tables if they don't exist
 */
function initializeDatabase() {
  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent access
  db.pragma('journal_mode = WAL');

  // Create waterfalls table
  db.exec(`
    CREATE TABLE IF NOT EXISTS waterfalls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mongo_id TEXT UNIQUE,
      name TEXT NOT NULL UNIQUE,
      slug TEXT,
      description TEXT NOT NULL,
      state TEXT NOT NULL,
      location_type TEXT DEFAULT 'Point',
      location_lng REAL,
      location_lat REAL,
      water_source TEXT,
      waterfall_profile TEXT,
      accessibility TEXT,
      img_details TEXT,
      url TEXT,
      locality TEXT,
      summary TEXT,
      last_update TEXT,
      difficulty TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for common queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_waterfalls_name ON waterfalls(name);
    CREATE INDEX IF NOT EXISTS idx_waterfalls_state ON waterfalls(state);
    CREATE INDEX IF NOT EXISTS idx_waterfalls_slug ON waterfalls(slug);
    CREATE INDEX IF NOT EXISTS idx_waterfalls_mongo_id ON waterfalls(mongo_id);
  `);

  console.log('SQLite database initialized successfully');
  return db;
}

/**
 * Get the database instance (initialize if needed)
 */
function getDb() {
  if (!db) {
    initializeDatabase();
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
 * Convert a database row to a waterfall object matching the Mongoose format
 */
function rowToWaterfall(row) {
  if (!row) return null;

  return {
    _id: row.mongo_id || row.id.toString(),
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    state: row.state,
    location: {
      type: row.location_type || 'Point',
      coordinates: [row.location_lng, row.location_lat]
    },
    waterSource: row.water_source,
    waterfallProfile: row.waterfall_profile,
    accessibility: row.accessibility,
    imgDetails: row.img_details ? JSON.parse(row.img_details) : null,
    url: row.url,
    locality: row.locality,
    summary: row.summary,
    lastUpdate: row.last_update,
    difficulty: row.difficulty
  };
}

/**
 * Waterfall model class with Mongoose-like interface
 */
class WaterfallModel {
  /**
   * Find all waterfalls with optional filtering, sorting, and pagination
   * @param {Object} filter - Query filter object
   * @param {Object} options - Query options (sort, limit, skip, fields)
   * @returns {Array} Array of waterfall objects
   */
  static find(filter = {}, options = {}) {
    const database = getDb();
    let sql = 'SELECT * FROM waterfalls';
    const params = [];
    const conditions = [];

    // Build WHERE clause from filter
    if (filter.state) {
      conditions.push('state = ?');
      params.push(filter.state);
    }
    if (filter.name) {
      conditions.push('name = ?');
      params.push(filter.name);
    }
    if (filter.difficulty) {
      conditions.push('difficulty = ?');
      params.push(filter.difficulty);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Handle sorting
    if (options.sort) {
      const sortField = options.sort.startsWith('-')
        ? options.sort.substring(1)
        : options.sort;
      const sortOrder = options.sort.startsWith('-') ? 'DESC' : 'ASC';

      // Map Mongoose field names to SQLite column names
      const fieldMap = {
        name: 'name',
        state: 'state',
        difficulty: 'difficulty',
        lastUpdate: 'last_update',
        createdAt: 'created_at'
      };

      const sqlField = fieldMap[sortField] || 'name';
      sql += ` ORDER BY ${sqlField} ${sortOrder}`;
    } else {
      sql += ' ORDER BY name ASC';
    }

    // Handle pagination
    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }
    if (options.skip) {
      sql += ' OFFSET ?';
      params.push(options.skip);
    }

    const stmt = database.prepare(sql);
    const rows = stmt.all(...params);

    return rows.map(rowToWaterfall);
  }

  /**
   * Find a waterfall by ID (supports both SQLite id and MongoDB _id)
   * @param {string|number} id - The waterfall ID
   * @returns {Object|null} Waterfall object or null
   */
  static findById(id) {
    const database = getDb();

    // Try to find by mongo_id first, then by SQLite id
    let stmt = database.prepare('SELECT * FROM waterfalls WHERE mongo_id = ?');
    let row = stmt.get(id);

    if (!row) {
      stmt = database.prepare('SELECT * FROM waterfalls WHERE id = ?');
      row = stmt.get(id);
    }

    return rowToWaterfall(row);
  }

  /**
   * Find a single waterfall matching the filter
   * @param {Object} filter - Query filter object
   * @returns {Object|null} Waterfall object or null
   */
  static findOne(filter = {}) {
    const results = this.find(filter, { limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Create a new waterfall
   * @param {Object} data - Waterfall data
   * @returns {Object} Created waterfall object
   */
  static create(data) {
    const database = getDb();

    // Generate slug if not provided
    const slug = data.slug || slugify(data.name, { lower: true });

    // Extract coordinates
    let lng = null;
    let lat = null;
    if (data.location && data.location.coordinates) {
      [lng, lat] = data.location.coordinates;
    }

    const stmt = database.prepare(`
      INSERT INTO waterfalls (
        mongo_id, name, slug, description, state, location_type, location_lng, location_lat,
        water_source, waterfall_profile, accessibility, img_details, url, locality, summary,
        last_update, difficulty
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data._id || null,
      data.name,
      slug,
      data.description,
      data.state,
      data.location?.type || 'Point',
      lng,
      lat,
      data.waterSource || null,
      data.waterfallProfile || null,
      data.accessibility || null,
      data.imgDetails ? JSON.stringify(data.imgDetails) : null,
      data.url || null,
      data.locality || null,
      data.summary || null,
      data.lastUpdate || null,
      data.difficulty || null
    );

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Update a waterfall by ID
   * @param {string|number} id - The waterfall ID
   * @param {Object} data - Update data
   * @returns {Object|null} Updated waterfall object or null
   */
  static findByIdAndUpdate(id, data) {
    const database = getDb();

    // First find the record
    const existing = this.findById(id);
    if (!existing) return null;

    const updates = [];
    const params = [];

    // Build update query dynamically
    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
      // Update slug too
      updates.push('slug = ?');
      params.push(slugify(data.name, { lower: true }));
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.state !== undefined) {
      updates.push('state = ?');
      params.push(data.state);
    }
    if (data.location !== undefined) {
      updates.push('location_lng = ?');
      updates.push('location_lat = ?');
      params.push(data.location.coordinates[0]);
      params.push(data.location.coordinates[1]);
    }
    if (data.waterSource !== undefined) {
      updates.push('water_source = ?');
      params.push(data.waterSource);
    }
    if (data.waterfallProfile !== undefined) {
      updates.push('waterfall_profile = ?');
      params.push(data.waterfallProfile);
    }
    if (data.accessibility !== undefined) {
      updates.push('accessibility = ?');
      params.push(data.accessibility);
    }
    if (data.imgDetails !== undefined) {
      updates.push('img_details = ?');
      params.push(JSON.stringify(data.imgDetails));
    }
    if (data.url !== undefined) {
      updates.push('url = ?');
      params.push(data.url);
    }
    if (data.locality !== undefined) {
      updates.push('locality = ?');
      params.push(data.locality);
    }
    if (data.summary !== undefined) {
      updates.push('summary = ?');
      params.push(data.summary);
    }
    if (data.lastUpdate !== undefined) {
      updates.push('last_update = ?');
      params.push(data.lastUpdate);
    }
    if (data.difficulty !== undefined) {
      updates.push('difficulty = ?');
      params.push(data.difficulty);
    }

    // Always update updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length === 1) {
      // Only updated_at, no actual changes
      return existing;
    }

    // Add the ID condition
    params.push(existing.id);

    const sql = `UPDATE waterfalls SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = database.prepare(sql);
    stmt.run(...params);

    return this.findById(id);
  }

  /**
   * Delete a waterfall by ID
   * @param {string|number} id - The waterfall ID
   * @returns {boolean} True if deleted, false if not found
   */
  static delete(id) {
    const database = getDb();

    // First find the record
    const existing = this.findById(id);
    if (!existing) return false;

    const stmt = database.prepare('DELETE FROM waterfalls WHERE id = ?');
    const result = stmt.run(existing.id);

    return result.changes > 0;
  }

  /**
   * Aggregate function for geoNear queries (calculates distance from a point)
   * @param {Array} pipeline - MongoDB-like aggregation pipeline
   * @returns {Array} Waterfalls with calculated distances
   */
  static aggregate(pipeline) {
    const database = getDb();

    // Handle geoNear aggregation
    const geoNearStage = pipeline.find(stage => stage.$geoNear);
    const projectStage = pipeline.find(stage => stage.$project);

    if (!geoNearStage) {
      throw new Error('Only $geoNear aggregation is supported');
    }

    const { near, distanceField, distanceMultiplier = 1 } = geoNearStage.$geoNear;
    const [lng, lat] = near.coordinates;

    // Get all waterfalls and calculate distances
    const stmt = database.prepare('SELECT * FROM waterfalls');
    const rows = stmt.all();

    const results = rows.map(row => {
      const waterfall = rowToWaterfall(row);

      // Calculate distance using Haversine formula
      const distance = geoDistance(
        lat,
        lng,
        row.location_lat,
        row.location_lng
      ) * distanceMultiplier;

      // Apply projection if specified
      if (projectStage && projectStage.$project) {
        const projected = {};
        if (projectStage.$project.distance) {
          projected.distance = Math.round(distance * 100) / 100;
        }
        if (projectStage.$project.name) {
          projected.name = waterfall.name;
        }
        if (projectStage.$project._id !== 0) {
          projected._id = waterfall._id;
        }
        return projected;
      }

      return {
        ...waterfall,
        [distanceField]: Math.round(distance * 100) / 100
      };
    });

    // Sort by distance
    results.sort((a, b) => {
      const distA = a[distanceField] || a.distance || 0;
      const distB = b[distanceField] || b.distance || 0;
      return distA - distB;
    });

    return results;
  }

  /**
   * Count total waterfalls
   * @param {Object} filter - Optional filter object
   * @returns {number} Count of waterfalls
   */
  static count(filter = {}) {
    const database = getDb();
    let sql = 'SELECT COUNT(*) as count FROM waterfalls';
    const params = [];
    const conditions = [];

    if (filter.state) {
      conditions.push('state = ?');
      params.push(filter.state);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const stmt = database.prepare(sql);
    const result = stmt.get(...params);
    return result.count;
  }

  /**
   * Get waterfalls within a radius (using Haversine formula)
   * @param {number} lat - Center latitude
   * @param {number} lng - Center longitude
   * @param {number} radiusKm - Radius in kilometers
   * @returns {Array} Waterfalls within the radius
   */
  static findWithinRadius(lat, lng, radiusKm) {
    const database = getDb();

    // Get all waterfalls and filter by distance
    const stmt = database.prepare('SELECT * FROM waterfalls');
    const rows = stmt.all();

    const results = [];

    for (const row of rows) {
      const distance = geoDistance(lat, lng, row.location_lat, row.location_lng);

      if (distance <= radiusKm) {
        const waterfall = rowToWaterfall(row);
        waterfall.distance = Math.round(distance * 100) / 100;
        results.push(waterfall);
      }
    }

    // Sort by distance
    results.sort((a, b) => a.distance - b.distance);

    return results;
  }
}

module.exports = {
  initializeDatabase,
  getDb,
  closeDatabase,
  WaterfallModel,
  geoDistance,
  DB_PATH
};
