#!/usr/bin/env node

/**
 * Import script for waterfalls data
 * Reads waterfalls.json from data/dev-data/ and imports into SQLite database
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'waterfalls.db');
const JSON_PATH = path.join(__dirname, '..', 'data', 'dev-data', 'waterfalls.json');

console.log('='.repeat(60));
console.log('Splish Waterfall Database Import Script');
console.log('='.repeat(60));
console.log(`Database path: ${DB_PATH}`);
console.log(`JSON data path: ${JSON_PATH}`);
console.log('');

// Check if JSON file exists
if (!fs.existsSync(JSON_PATH)) {
  console.error(`ERROR: JSON file not found at ${JSON_PATH}`);
  process.exit(1);
}

// Remove existing database if it exists
if (fs.existsSync(DB_PATH)) {
  console.log('Removing existing database...');
  fs.unlinkSync(DB_PATH);
}

// Create new database
console.log('Creating new SQLite database...');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create waterfalls table
console.log('Creating waterfalls table...');
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

// Create indexes
console.log('Creating indexes...');
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_waterfalls_name ON waterfalls(name);
  CREATE INDEX IF NOT EXISTS idx_waterfalls_state ON waterfalls(state);
  CREATE INDEX IF NOT EXISTS idx_waterfalls_slug ON waterfalls(slug);
  CREATE INDEX IF NOT EXISTS idx_waterfalls_mongo_id ON waterfalls(mongo_id);
`);

// Read JSON data
console.log('Reading JSON data...');
const jsonData = fs.readFileSync(JSON_PATH, 'utf8');
const waterfalls = JSON.parse(jsonData);

console.log(`Found ${waterfalls.length} waterfalls to import`);
console.log('');

// Prepare insert statement
const insertStmt = db.prepare(`
  INSERT INTO waterfalls (
    mongo_id, name, slug, description, state, location_type, location_lng, location_lat,
    water_source, waterfall_profile, accessibility, img_details, url, locality, summary,
    last_update, difficulty
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Import all waterfalls in a transaction for better performance
console.log('Importing waterfalls...');
let imported = 0;
let skipped = 0;
let errors = 0;

const importAll = db.transaction((waterfallList) => {
  for (const waterfall of waterfallList) {
    try {
      // Extract coordinates (handle different coordinate formats)
      let lng = null;
      let lat = null;

      if (waterfall.location && waterfall.location.coordinates) {
        // Note: MongoDB stores as [lng, lat] but this data seems to have [lat, lng]
        // Based on the data, coordinates[0] appears to be latitude and [1] is longitude
        // Let's check the values - Malaysia coords should be around lat 2-7, lng 100-119
        const coord0 = waterfall.location.coordinates[0];
        const coord1 = waterfall.location.coordinates[1];

        // If coord0 is a small number (2-7) and coord1 is large (100-119), swap them
        // because GeoJSON standard is [lng, lat] but this data might be [lat, lng]
        if (coord0 < 10 && coord1 > 90) {
          // Data is in [lat, lng] format, convert to [lng, lat]
          lat = coord0;
          lng = coord1;
        } else if (coord0 > 90 && coord1 < 10) {
          // Data is correctly in [lng, lat] format
          lng = coord0;
          lat = coord1;
        } else {
          // Default to GeoJSON standard [lng, lat]
          lng = coord0;
          lat = coord1;
        }
      }

      insertStmt.run(
        waterfall._id || null,
        waterfall.name,
        waterfall.slug || null,
        waterfall.description || '',
        waterfall.state || 'Unknown',
        waterfall.location?.type || 'Point',
        lng,
        lat,
        waterfall.waterSource || null,
        waterfall.waterfallProfile || null,
        waterfall.accessibility || null,
        waterfall.imgDetails ? JSON.stringify(waterfall.imgDetails) : null,
        waterfall.url || null,
        waterfall.locality || null,
        waterfall.summary || null,
        waterfall.lastUpdate || null,
        waterfall.difficulty || null
      );

      imported++;

      // Progress indicator every 20 waterfalls
      if (imported % 20 === 0) {
        process.stdout.write(`  Imported ${imported}/${waterfallList.length}...\r`);
      }
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log(`  Skipped duplicate: ${waterfall.name}`);
        skipped++;
      } else {
        console.error(`  Error importing "${waterfall.name}": ${err.message}`);
        errors++;
      }
    }
  }
});

try {
  importAll(waterfalls);
} catch (err) {
  console.error(`Transaction failed: ${err.message}`);
  process.exit(1);
}

console.log('');
console.log('='.repeat(60));
console.log('Import Summary:');
console.log('-'.repeat(60));
console.log(`  Total waterfalls in JSON: ${waterfalls.length}`);
console.log(`  Successfully imported:    ${imported}`);
console.log(`  Skipped (duplicates):     ${skipped}`);
console.log(`  Errors:                   ${errors}`);
console.log('='.repeat(60));

// Verify the import
const countStmt = db.prepare('SELECT COUNT(*) as count FROM waterfalls');
const result = countStmt.get();
console.log(`\nVerification: ${result.count} waterfalls in database`);

// Show sample data
console.log('\nSample data (first 3 waterfalls):');
const sampleStmt = db.prepare('SELECT id, name, state, location_lat, location_lng FROM waterfalls LIMIT 3');
const samples = sampleStmt.all();
samples.forEach(sample => {
  console.log(`  - ${sample.name} (${sample.state}) @ [${sample.location_lat}, ${sample.location_lng}]`);
});

// Show state distribution
console.log('\nWaterfalls by state:');
const stateStmt = db.prepare('SELECT state, COUNT(*) as count FROM waterfalls GROUP BY state ORDER BY count DESC');
const states = stateStmt.all();
states.forEach(state => {
  console.log(`  ${state.state}: ${state.count}`);
});

// Close database
db.close();

console.log('\nDatabase import complete!');
console.log(`Database file: ${DB_PATH}`);
