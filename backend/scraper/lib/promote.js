const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const slugify = require('slugify');
const config = require('../config');

function canonicalName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b(?:the|waterfalls?|falls?)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function stableSourceId(url) {
  return `wom-${crypto.createHash('sha256').update(url).digest('hex').slice(0, 24)}`;
}

function chooseExisting(record, existingRows, claimedIds) {
  const available = existingRows.filter(row => !claimedIds.has(row.id));
  const nameMatches = available.filter(row => canonicalName(row.name) === canonicalName(record.name));
  if (nameMatches.length === 1) return nameMatches[0];
  const urlMatches = available.filter(row => row.url === record.url);
  if (urlMatches.length === 1) return urlMatches[0];
  if (urlMatches.length > 1) {
    return urlMatches.sort((a, b) => {
      const aScore = canonicalName(record.name).includes(canonicalName(a.name)) || canonicalName(a.name).includes(canonicalName(record.name));
      const bScore = canonicalName(record.name).includes(canonicalName(b.name)) || canonicalName(b.name).includes(canonicalName(record.name));
      return Number(bScore) - Number(aScore);
    })[0];
  }
  return null;
}

function loadCatalog() {
  const catalogPath = path.join(config.paths.staging, 'catalog.json');
  if (!fs.existsSync(catalogPath)) throw new Error('No staged catalog found; run the stage command first');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  if (catalog.metadata.stateFilter) throw new Error('Refusing to promote a partial state snapshot');
  if (catalog.report.totals.withErrors || catalog.report.totals.failedFetches) {
    throw new Error('Refusing to promote a catalog with validation or fetch errors');
  }
  if (catalog.records.length !== catalog.metadata.listingCount) {
    throw new Error('Refusing to promote an incomplete catalog');
  }
  return catalog;
}

function planPromotion(catalog, database) {
  const existingRows = database.prepare('SELECT * FROM waterfalls ORDER BY id').all();
  const claimedIds = new Set();
  const assignments = catalog.records.map(record => {
    const existing = chooseExisting(record, existingRows, claimedIds);
    if (existing) claimedIds.add(existing.id);
    return { record, existing };
  });
  return {
    assignments,
    inserted: assignments.filter(item => !item.existing).length,
    updated: assignments.filter(item => item.existing).length,
    preservedUnlisted: existingRows.filter(row => !claimedIds.has(row.id)).length
  };
}

async function promoteCatalog(options = {}) {
  const catalog = loadCatalog();
  const database = new Database(config.paths.database);
  database.pragma('journal_mode = WAL');
  database.exec('CREATE TABLE IF NOT EXISTS catalog_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  const plan = planPromotion(catalog, database);
  if (options.dryRun !== false) {
    database.close();
    return { dryRun: true, ...plan, assignments: undefined };
  }

  const backupDirectory = path.join(path.dirname(config.paths.database), 'backups');
  fs.mkdirSync(backupDirectory, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDirectory, `waterfalls-${stamp}.db`);
  await database.backup(backupPath);

  const update = database.prepare(`
    UPDATE waterfalls SET
      name = ?, slug = ?, description = ?, state = ?, location_type = ?,
      location_lng = ?, location_lat = ?, water_source = ?, waterfall_profile = ?,
      accessibility = ?, img_details = ?, url = ?, locality = ?, summary = ?,
      last_update = ?, difficulty = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const insert = database.prepare(`
    INSERT INTO waterfalls (
      mongo_id, name, slug, description, state, location_type, location_lng,
      location_lat, water_source, waterfall_profile, accessibility, img_details,
      url, locality, summary, last_update, difficulty
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const values = (record, existing = null) => {
    const [longitude = existing?.location_lng ?? null, latitude = existing?.location_lat ?? null] = record.location?.coordinates || [];
    return [
      record.name,
      slugify(record.name, { lower: true, strict: true }),
      record.description || existing?.description || null,
      record.state,
      record.location?.type || 'Point',
      longitude,
      latitude,
      record.waterSource || null,
      record.waterfallProfile || null,
      record.accessibility || null,
      JSON.stringify(record.imgDetails || {}),
      record.url,
      record.locality || null,
      record.summary || null,
      record.lastUpdate || null,
      record.difficulty || null
    ];
  };
  const apply = database.transaction(() => {
    for (const { record, existing } of plan.assignments) {
      if (existing) update.run(...values(record, existing), existing.id);
      else insert.run(stableSourceId(record.url), ...values(record));
    }
    const setMetadata = database.prepare(`
      INSERT INTO catalog_metadata (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    const version = crypto.createHash('sha256')
      .update(JSON.stringify(catalog.records.map(record => [record.url, record.lastUpdate])))
      .digest('hex').slice(0, 16);
    for (const [key, value] of Object.entries({
      catalog_version: version,
      source_snapshot_at: catalog.metadata.generatedAt,
      source_url: catalog.metadata.source,
      active_records: String(catalog.records.length),
      map_entries: String(catalog.metadata.mapEntryCount || 0),
      schema_version: '1'
    })) setMetadata.run(key, value);
  });
  try {
    apply();
    const total = database.prepare('SELECT COUNT(*) AS count FROM waterfalls').get().count;
    database.close();
    return { dryRun: false, backupPath, total, ...plan, assignments: undefined };
  } catch (error) {
    database.close();
    throw error;
  }
}

module.exports = { canonicalName, chooseExisting, loadCatalog, planPromotion, promoteCatalog, stableSourceId };
