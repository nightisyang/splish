const axios = require('axios');
const config = require('../config');
const { parseWaterfallPage, parseStatePage, needsClaudeParsing } = require('./parser');
const { parseWithClaude, isClaudeAvailable } = require('./claudeParser');
const db = require('./database');
const { downloadWaterfallImages } = require('./imageHandler');

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch HTML content from a URL with retries
 * @param {string} url - URL to fetch
 * @returns {string|null} HTML content or null on failure
 */
async function fetchPage(url) {
  let lastError = null;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SplishScraper/1.0)'
        }
      });
      return response.data;
    } catch (err) {
      lastError = err;
      if (attempt < config.maxRetries) {
        await sleep(config.retryDelayMs);
      }
    }
  }

  console.error(`Failed to fetch ${url}: ${lastError?.message}`);
  return null;
}

/**
 * Fetch all waterfall URLs for a state
 * @param {number} stateId - State ID (1-13)
 * @returns {Array} Array of waterfall URLs
 */
async function fetchStateUrls(stateId) {
  const url = `${config.baseUrl}/state.php?state_id=${stateId}`;
  const html = await fetchPage(url);

  if (!html) {
    return [];
  }

  return parseStatePage(html);
}

/**
 * Scrape a single waterfall page
 * @param {string} urlPath - The PHP page path (e.g., "131airhitam.php")
 * @param {Object} options - Scraping options
 * @returns {Object|null} Scraped waterfall data or null
 */
async function scrapeWaterfall(urlPath, options = {}) {
  const { verbose = false, useClaudeOnFail = true } = options;
  const fullUrl = urlPath.startsWith('http') ? urlPath : `${config.baseUrl}/${urlPath}`;

  if (verbose) {
    console.log(`Scraping: ${urlPath}`);
  }

  const html = await fetchPage(fullUrl);
  if (!html) {
    return null;
  }

  // Try standard parsing first
  let parsed = parseWaterfallPage(html, urlPath);

  // Check if we need Claude CLI fallback
  if (useClaudeOnFail && needsClaudeParsing(parsed, urlPath)) {
    if (isClaudeAvailable()) {
      if (verbose) {
        console.log(`  Using Claude CLI for problematic page: ${urlPath}`);
      }
      const claudeParsed = await parseWithClaude(html, urlPath);
      if (claudeParsed) {
        parsed = claudeParsed;
      }
    } else if (verbose) {
      console.log(`  Warning: Claude CLI not available for fallback parsing`);
    }
  }

  return parsed;
}

/**
 * Run a full sync across all states
 * @param {Object} options - Sync options
 * @returns {Object} Sync statistics
 */
async function sync(options = {}) {
  const {
    dryRun = false,
    verbose = false,
    noImages = false,
    force = false,
    stateFilter = null
  } = options;

  const stats = {
    started: new Date().toISOString(),
    statesProcessed: 0,
    waterfallsScraped: 0,
    inserted: 0,
    updated: 0,
    unchanged: 0,
    deleted: 0,
    failed: 0,
    imagesDownloaded: 0,
    imagesSkipped: 0,
    imagesFailed: 0,
    errors: []
  };

  if (verbose) {
    console.log('Starting sync...');
    if (dryRun) console.log('  (dry-run mode - no changes will be made)');
  }

  // Get existing URLs for comparison
  const existingUrls = db.getExistingUrls();
  const scrapedUrls = new Set();

  // Determine which states to process
  let stateIds = config.stateIds;
  if (stateFilter) {
    const stateId = config.stateNameToId[stateFilter];
    if (stateId) {
      stateIds = [stateId];
    } else {
      console.error(`Unknown state: ${stateFilter}`);
      return stats;
    }
  }

  // Process each state
  for (const stateId of stateIds) {
    const stateName = config.stateNames[stateId];
    if (verbose) {
      console.log(`\nProcessing state: ${stateName} (${stateId})`);
    }

    // Fetch waterfall URLs for this state
    const urls = await fetchStateUrls(stateId);
    if (verbose) {
      console.log(`  Found ${urls.length} waterfalls`);
    }

    // Process each waterfall
    for (const urlPath of urls) {
      scrapedUrls.add(urlPath);
      stats.waterfallsScraped++;

      // Polite delay between requests
      await sleep(config.requestDelayMs);

      try {
        const data = await scrapeWaterfall(urlPath, { verbose });

        if (!data) {
          stats.failed++;
          stats.errors.push({ url: urlPath, error: 'Failed to parse' });
          continue;
        }

        // Check if this is new or existing
        const existing = db.findByUrl(urlPath);
        const hasChanges = db.hasChanges(existing, data);

        if (!existing) {
          // New waterfall
          if (!dryRun) {
            db.upsertWaterfall(data);
          }
          stats.inserted++;
          if (verbose) {
            console.log(`  + NEW: ${data.name}`);
          }
        } else if (hasChanges) {
          // Updated waterfall
          if (!dryRun) {
            db.upsertWaterfall(data);
          }
          stats.updated++;
          if (verbose) {
            console.log(`  ~ UPDATED: ${data.name}`);
          }
        } else {
          // No changes
          stats.unchanged++;
          if (verbose) {
            console.log(`  = UNCHANGED: ${data.name}`);
          }
        }

        // Download images if needed
        if (!noImages && !dryRun && (force || !existing || hasChanges)) {
          const imgStats = await downloadWaterfallImages(data, { force, verbose });
          stats.imagesDownloaded += imgStats.downloaded;
          stats.imagesSkipped += imgStats.skipped;
          stats.imagesFailed += imgStats.failed;
        }
      } catch (err) {
        stats.failed++;
        stats.errors.push({ url: urlPath, error: err.message });
        if (verbose) {
          console.error(`  ERROR: ${urlPath} - ${err.message}`);
        }
      }
    }

    stats.statesProcessed++;
  }

  // Mark removed waterfalls as deleted
  if (!dryRun) {
    for (const url of existingUrls) {
      if (!scrapedUrls.has(url)) {
        db.markAsDeleted(url);
        stats.deleted++;
        if (verbose) {
          console.log(`  - DELETED: ${url}`);
        }
      }
    }
  } else if (verbose) {
    // In dry-run, just count how many would be deleted
    for (const url of existingUrls) {
      if (!scrapedUrls.has(url)) {
        stats.deleted++;
        console.log(`  - WOULD DELETE: ${url}`);
      }
    }
  }

  stats.finished = new Date().toISOString();

  if (verbose) {
    console.log('\n=== Sync Complete ===');
    console.log(`States processed: ${stats.statesProcessed}`);
    console.log(`Waterfalls scraped: ${stats.waterfallsScraped}`);
    console.log(`  New: ${stats.inserted}`);
    console.log(`  Updated: ${stats.updated}`);
    console.log(`  Unchanged: ${stats.unchanged}`);
    console.log(`  Deleted: ${stats.deleted}`);
    console.log(`  Failed: ${stats.failed}`);
    if (!noImages) {
      console.log(`Images: ${stats.imagesDownloaded} downloaded, ${stats.imagesSkipped} skipped, ${stats.imagesFailed} failed`);
    }
  }

  return stats;
}

/**
 * Scrape a single waterfall and optionally save to database
 * @param {string} urlPath - The PHP page path
 * @param {Object} options - Options
 * @returns {Object} Result object
 */
async function scrapeSingle(urlPath, options = {}) {
  const { dryRun = false, verbose = false, noImages = false } = options;

  const data = await scrapeWaterfall(urlPath, { verbose });

  if (!data) {
    return { success: false, error: 'Failed to parse page' };
  }

  if (verbose) {
    console.log('Scraped data:');
    console.log(JSON.stringify(data, null, 2));
  }

  if (!dryRun) {
    const result = db.upsertWaterfall(data);
    if (verbose) {
      console.log(`Database: ${result.action} (id: ${result.id})`);
    }

    if (!noImages) {
      const imgStats = await downloadWaterfallImages(data, { verbose });
      if (verbose) {
        console.log(`Images: ${imgStats.downloaded} downloaded, ${imgStats.skipped} skipped`);
      }
    }

    return { success: true, action: result.action, data };
  }

  return { success: true, action: 'dry-run', data };
}

module.exports = {
  sync,
  scrapeSingle,
  scrapeWaterfall,
  fetchStateUrls,
  fetchPage
};
