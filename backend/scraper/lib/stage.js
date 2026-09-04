const fs = require('fs');
const path = require('path');
const config = require('../config');
const { fetchPage } = require('./scraper');
const { parseMapEntries, parseStateEntries, parseWaterfallPage, needsLlmReview } = require('./parser');
const { buildQualityReport } = require('./quality');
const { isCodexAvailable, reviewDescriptionWithCodex } = require('./codexReview');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function mergeListingAndDetail(listing, detail, mapEntry = null) {
  return {
    ...detail,
    name: detail.name || listing.name,
    state: detail.state || listing.state,
    locality: listing.locality || detail.locality,
    summary: listing.summary,
    difficulty: listing.difficulty,
    lastUpdate: listing.lastUpdate,
    location: detail.location || mapEntry?.location || null,
    coordinateSource: detail.location ? detail.coordinateSource : mapEntry ? 'source_map' : null,
    imgDetails: {
      ...detail.imgDetails,
      listingImageFilename: listing.listingImageFilename,
      listingImageUrl: listing.listingImageUrl
    },
    url: listing.url
  };
}

function writeJson(filepath, value) {
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  const temporaryPath = `${filepath}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(temporaryPath, filepath);
}

async function stageCatalog(options = {}) {
  const {
    stateFilter = null,
    limit = null,
    useLlm = false,
    verbose = false
  } = options;
  let stateIds = config.stateIds;
  if (stateFilter) {
    const stateId = config.stateNameToId[stateFilter];
    if (!stateId) throw new Error(`Unknown state: ${stateFilter}`);
    stateIds = [stateId];
  }
  if (useLlm && !isCodexAvailable()) throw new Error('Codex CLI is not available');

  const records = [];
  const failures = [];
  const seenUrls = new Set();
  let listingCount = 0;
  let llmReviews = 0;
  const mapHtml = await fetchPage(`${config.baseUrl}/newmap.php`);
  const mapEntries = new Map(parseMapEntries(mapHtml).map(entry => [entry.url, entry]));

  for (const stateId of stateIds) {
    const stateName = config.stateNames[stateId];
    const listingUrl = `${config.baseUrl}/state.php?state_id=${stateId}`;
    const listingHtml = await fetchPage(listingUrl);
    if (!listingHtml) {
      failures.push({ url: listingUrl, stage: 'listing', error: 'fetch_failed' });
      continue;
    }
    const listings = parseStateEntries(listingHtml, { stateId, stateName });
    listingCount += listings.length;
    if (verbose) console.log(`${stateName}: ${listings.length} listings`);

    for (const listing of listings) {
      if (seenUrls.has(listing.url)) continue;
      if (limit && records.length >= limit) break;
      seenUrls.add(listing.url);
      await sleep(config.requestDelayMs);
      const detailHtml = await fetchPage(`${config.baseUrl}/${listing.url}`);
      if (!detailHtml) {
        failures.push({ url: listing.url, stage: 'detail', error: 'fetch_failed' });
        continue;
      }
      const detail = parseWaterfallPage(detailHtml, listing.url);
      if (!detail) {
        failures.push({ url: listing.url, stage: 'detail', error: 'parse_failed' });
        continue;
      }
      const record = mergeListingAndDetail(listing, detail, mapEntries.get(listing.url));
      if (useLlm && needsLlmReview(record)) {
        try {
          const review = reviewDescriptionWithCodex(record);
          if (review.changed) record.description = review.description;
          record.descriptionReview = { provider: 'codex', ...review };
          llmReviews++;
        } catch (error) {
          failures.push({ url: listing.url, stage: 'llm_review', error: error.message });
        }
      }
      records.push(record);
      if (verbose && records.length % 25 === 0) console.log(`  Parsed ${records.length} records`);
    }
    if (limit && records.length >= limit) break;
  }

  const report = buildQualityReport(records, failures);
  const snapshot = {
    metadata: {
      source: config.baseUrl,
      generatedAt: new Date().toISOString(),
      listingCount,
      recordCount: records.length,
      llmReviews,
      mapEntryCount: mapEntries.size,
      stateFilter
    },
    records,
    report
  };
  const catalogPath = path.join(config.paths.staging, 'catalog.json');
  const reportPath = path.join(config.paths.staging, 'quality-report.json');
  writeJson(catalogPath, snapshot);
  writeJson(reportPath, report);
  return { catalogPath, reportPath, ...snapshot.metadata, report };
}

module.exports = { mergeListingAndDetail, stageCatalog };
