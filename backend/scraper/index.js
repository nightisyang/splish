#!/usr/bin/env node

const { program } = require('commander');
const { sync, scrapeSingle } = require('./lib/scraper');
const db = require('./lib/database');
const { verifyImages, getImageStats } = require('./lib/imageHandler');
const config = require('./config');

program
  .name('scraper')
  .description('Splish Waterfall Scraper - Incremental sync tool for waterfallsofmalaysia.com')
  .version('1.0.0');

// Sync command
program
  .command('sync')
  .description('Sync waterfalls from all states (or a specific state)')
  .option('--dry-run', 'Preview changes without writing to database')
  .option('--verbose', 'Enable verbose logging')
  .option('--no-images', 'Skip image downloads')
  .option('--force', 'Re-download existing images')
  .option('--state <name>', 'Sync only a specific state (e.g., Selangor)')
  .action(async (options) => {
    try {
      const stats = await sync({
        dryRun: options.dryRun,
        verbose: options.verbose,
        noImages: !options.images,
        force: options.force,
        stateFilter: options.state
      });

      if (!options.verbose) {
        console.log('\nSync Summary:');
        console.log(`  New waterfalls: ${stats.inserted}`);
        console.log(`  Updated: ${stats.updated}`);
        console.log(`  Unchanged: ${stats.unchanged}`);
        console.log(`  Marked deleted: ${stats.deleted}`);
        console.log(`  Failed: ${stats.failed}`);
        if (options.images !== false) {
          console.log(`  Images downloaded: ${stats.imagesDownloaded}`);
        }
      }

      if (stats.errors.length > 0) {
        console.log('\nErrors:');
        stats.errors.forEach(e => console.log(`  ${e.url}: ${e.error}`));
      }

      db.closeDatabase();
      process.exit(stats.failed > 0 ? 1 : 0);
    } catch (err) {
      console.error('Sync failed:', err.message);
      db.closeDatabase();
      process.exit(1);
    }
  });

// Scrape single waterfall command
program
  .command('scrape <url>')
  .description('Scrape a single waterfall page (e.g., 131airhitam.php)')
  .option('--dry-run', 'Preview without writing to database')
  .option('--verbose', 'Enable verbose logging')
  .option('--no-images', 'Skip image downloads')
  .action(async (url, options) => {
    try {
      const result = await scrapeSingle(url, {
        dryRun: options.dryRun,
        verbose: options.verbose,
        noImages: !options.images
      });

      if (result.success) {
        console.log(`\nSuccess: ${result.action}`);
        if (!options.verbose) {
          console.log(`  Name: ${result.data.name}`);
          console.log(`  State: ${result.data.state}`);
          console.log(`  Images: ${result.data.imgDetails?.imgUrl?.length || 0}`);
        }
      } else {
        console.error(`Failed: ${result.error}`);
      }

      db.closeDatabase();
      process.exit(result.success ? 0 : 1);
    } catch (err) {
      console.error('Scrape failed:', err.message);
      db.closeDatabase();
      process.exit(1);
    }
  });

// Check images command
program
  .command('check-images')
  .description('Verify local images against database records')
  .option('--verbose', 'Show details for each waterfall')
  .action(async (options) => {
    try {
      const waterfalls = db.getAllWaterfalls();
      const results = verifyImages(waterfalls);
      const diskStats = getImageStats();

      console.log('\nImage Verification Results:');
      console.log(`  Total referenced: ${results.total}`);
      console.log(`  Exists on disk: ${results.exists}`);
      console.log(`  Missing: ${results.missing.length}`);
      console.log(`\nDisk Statistics:`);
      console.log(`  Total files: ${diskStats.count}`);
      console.log(`  Total size: ${diskStats.sizeFormatted}`);

      if (options.verbose && results.byWaterfall.length > 0) {
        console.log('\nMissing by waterfall:');
        results.byWaterfall.forEach(w => {
          console.log(`  ${w.name} (${w.url}):`);
          w.missing.forEach(f => console.log(`    - ${f}`));
        });
      } else if (results.missing.length > 0) {
        console.log(`\nRun with --verbose to see details of missing images.`);
      }

      db.closeDatabase();
      process.exit(results.missing.length > 0 ? 1 : 0);
    } catch (err) {
      console.error('Check failed:', err.message);
      db.closeDatabase();
      process.exit(1);
    }
  });

// Stats command
program
  .command('stats')
  .description('Show database and scraper statistics')
  .action(async () => {
    try {
      const dbStats = db.getStats();
      const imgStats = getImageStats();

      console.log('\nDatabase Statistics:');
      console.log(`  Total waterfalls: ${dbStats.total}`);
      console.log(`  Deleted (soft): ${dbStats.deleted}`);
      console.log('\nBy State:');
      Object.entries(dbStats.byState).forEach(([state, count]) => {
        console.log(`  ${state}: ${count}`);
      });

      console.log('\nImage Statistics:');
      console.log(`  Files on disk: ${imgStats.count}`);
      console.log(`  Total size: ${imgStats.sizeFormatted}`);

      console.log('\nConfiguration:');
      console.log(`  Base URL: ${config.baseUrl}`);
      console.log(`  Request delay: ${config.requestDelayMs}ms`);
      console.log(`  Problematic pages: ${config.problematicPages.length}`);

      db.closeDatabase();
    } catch (err) {
      console.error('Stats failed:', err.message);
      db.closeDatabase();
      process.exit(1);
    }
  });

// List states command
program
  .command('list-states')
  .description('List all states and their IDs')
  .action(() => {
    console.log('\nMalaysian States:');
    Object.entries(config.stateNames).forEach(([id, name]) => {
      console.log(`  ${id}: ${name}`);
    });
  });

program.parse();
