#!/usr/bin/env node

const { program } = require('commander');
const { sync, scrapeSingle } = require('./lib/scraper');
const db = require('./lib/database');
const { verifyImages, getImageStats } = require('./lib/imageHandler');
const fs = require('fs');
const path = require('path');
const config = require('./config');
require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });

program
  .name('scraper')
  .description('Splish Waterfall Scraper - Incremental sync tool for waterfallsofmalaysia.com')
  .version('1.0.0');

program
  .command('stage')
  .description('Build and validate a source snapshot without changing the live database')
  .option('--state <name>', 'Stage only one state')
  .option('--limit <count>', 'Stop after this many records', value => Number.parseInt(value, 10))
  .option('--llm', 'Use Codex only for descriptions flagged by deterministic validation')
  .option('--verbose', 'Show progress')
  .action(async (options) => {
    try {
      const { stageCatalog } = require('./lib/stage');
      const result = await stageCatalog({
        stateFilter: options.state,
        limit: options.limit,
        useLlm: options.llm,
        verbose: options.verbose
      });
      console.log('\nStaging complete:');
      console.log(`  Source listings: ${result.listingCount}`);
      console.log(`  Parsed records: ${result.recordCount}`);
      console.log(`  LLM reviews: ${result.llmReviews}`);
      console.log(`  Errors: ${result.report.totals.withErrors}`);
      console.log(`  Warnings: ${result.report.totals.withWarnings}`);
      console.log(`  Needs LLM review: ${result.report.totals.needingLlmReview}`);
      console.log(`  Catalog: ${result.catalogPath}`);
      console.log(`  Report: ${result.reportPath}`);
      process.exit(result.report.totals.withErrors || result.report.totals.failedFetches ? 1 : 0);
    } catch (error) {
      console.error('Staging failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('assets')
  .description('Download listing thumbnails, detail thumbnails, and full-size images for the staged catalog')
  .option('--force', 'Re-download files that already exist')
  .option('--verbose', 'Show progress')
  .action(async (options) => {
    try {
      const { downloadCatalogImages } = require('./lib/imageHandler');
      const catalogPath = path.join(config.paths.staging, 'catalog.json');
      if (!fs.existsSync(catalogPath)) throw new Error('No staged catalog found; run the stage command first');
      const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      const result = await downloadCatalogImages(catalog.records, {
        force: options.force,
        verbose: options.verbose
      });
      const reportPath = path.join(config.paths.staging, 'asset-report.json');
      fs.writeFileSync(reportPath, `${JSON.stringify({
        generatedAt: new Date().toISOString(),
        ...result
      }, null, 2)}\n`);
      console.log('\nAsset refresh complete:');
      console.log(`  Total: ${result.total}`);
      console.log(`  Reused from legacy assets: ${result.reused}`);
      console.log(`  Downloaded: ${result.downloaded}`);
      console.log(`  Already present: ${result.skipped}`);
      console.log(`  Source thumbnail fallbacks: ${result.sourceFallbacks}`);
      console.log(`  Failed: ${result.failed}`);
      console.log(`  Report: ${reportPath}`);
      process.exit(result.failed ? 1 : 0);
    } catch (error) {
      console.error('Asset refresh failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('promote')
  .description('Validate and promote the staged catalog into the live SQLite database')
  .option('--apply', 'Create a backup and apply the promotion; otherwise only show the plan')
  .action(async (options) => {
    try {
      const { promoteCatalog } = require('./lib/promote');
      const result = await promoteCatalog({ dryRun: !options.apply });
      console.log(options.apply ? '\nCatalog promoted:' : '\nPromotion preview:');
      console.log(`  Existing records updated: ${result.updated}`);
      console.log(`  New records inserted: ${result.inserted}`);
      console.log(`  Existing unlisted records preserved: ${result.preservedUnlisted}`);
      if (result.backupPath) console.log(`  Backup: ${result.backupPath}`);
      if (result.total) console.log(`  Database records: ${result.total}`);
    } catch (error) {
      console.error('Promotion failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('publish-assets')
  .description('Publish staged catalog images to R2 or another S3-compatible object store')
  .option('--apply', 'Upload objects; otherwise show a local preview')
  .option('--force', 'Upload objects even when their checksum is unchanged')
  .option('--verbose', 'Show progress')
  .action(async (options) => {
    try {
      const { publishCatalogAssets } = require('./lib/objectStorage');
      const catalogPath = path.join(config.paths.staging, 'catalog.json');
      if (!fs.existsSync(catalogPath)) throw new Error('No staged catalog found; run the stage command first');
      const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      const result = await publishCatalogAssets(catalog.records, options);
      const reportPath = path.join(config.paths.staging, 'object-storage-report.json');
      fs.writeFileSync(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), ...result }, null, 2)}\n`);
      console.log(options.apply ? '\nAsset publication complete:' : '\nAsset publication preview:');
      console.log(`  Objects: ${result.objects}`);
      console.log(`  Bytes: ${result.totalBytes}`);
      if (options.apply) {
        console.log(`  Uploaded: ${result.uploaded}`);
        console.log(`  Unchanged: ${result.skipped}`);
        console.log(`  Failed: ${result.failed}`);
        console.log(`  Public base URL: ${result.publicBaseUrl}`);
      }
      console.log(`  Report: ${reportPath}`);
      process.exit(result.failed ? 1 : 0);
    } catch (error) {
      console.error('Asset publication failed:', error.message);
      process.exit(1);
    }
  });

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
