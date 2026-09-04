const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const config = require('../config');

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an image file already exists
 * @param {string} filename - Image filename
 * @returns {boolean} True if file exists
 */
function imageExists(filename) {
  const filepath = resolveImagePath(filename);
  return fs.existsSync(filepath);
}

function resolveImagePath(filename) {
  const root = path.resolve(config.paths.images);
  const filepath = path.resolve(root, filename);
  if (filepath !== root && !filepath.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Unsafe image filename: ${filename}`);
  }
  return filepath;
}

/**
 * Download a single image with retries
 * @param {string} url - Image URL
 * @param {string} filename - Target filename
 * @param {Object} options - Download options
 * @returns {Object} Result object
 */
async function downloadImage(url, filename, options = {}) {
  const { force = false, retries = config.maxRetries } = options;
  const filepath = resolveImagePath(filename);
  const temporaryPath = `${filepath}.part-${process.pid}`;

  // Skip if exists and not forcing
  if (!force && imageExists(filename)) {
    return { status: 'skipped', filename, reason: 'exists' };
  }

  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        timeout: 30000,
        headers: { 'User-Agent': 'SplishCatalogRefresh/2.0' }
      });

      const contentType = String(response.headers['content-type'] || '');
      if (!contentType.startsWith('image/')) {
        response.data.destroy();
        throw new Error(`Expected an image but received ${contentType || 'an unknown content type'}`);
      }

      fs.mkdirSync(path.dirname(filepath), { recursive: true });

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(temporaryPath);
        response.data.pipe(writer);
        writer.on('error', reject);
        writer.on('finish', resolve);
      });
      fs.renameSync(temporaryPath, filepath);

      return { status: 'downloaded', filename };
    } catch (err) {
      lastError = err;
      if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
      if (attempt < retries) {
        const delay = config.retryDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
        await sleep(delay);
      }
    }
  }

  return {
    status: 'failed',
    filename,
    error: lastError?.message || 'Unknown error'
  };
}

/**
 * Fetch and parse full resolution image URL from the image page
 * @param {string} imagePageUrl - URL of the image page
 * @returns {string|null} Full resolution image URL or null
 */
async function getFullResImageUrl(imagePageUrl) {
  try {
    const response = await axios.get(imagePageUrl, { timeout: 30000 });
    const $ = cheerio.load(response.data);

    let fullResUrl = null;
    $('td').each(function() {
      const imgSrc = $(this).find('img').attr('src');
      if (imgSrc && imgSrc.includes('/images/')) {
        fullResUrl = imgSrc;
      }
    });

    return fullResUrl;
  } catch (err) {
    console.error(`Error fetching full-res URL from ${imagePageUrl}:`, err.message);
    return null;
  }
}

/**
 * Download all images for a waterfall
 * @param {Object} waterfall - Waterfall data with imgDetails
 * @param {Object} options - Download options
 * @returns {Object} Statistics object
 */
async function downloadWaterfallImages(waterfall, options = {}) {
  const { force = false, verbose = false } = options;
  const stats = {
    downloaded: 0,
    skipped: 0,
    failed: 0,
    details: []
  };

  if (!waterfall.imgDetails) {
    return stats;
  }

  const details = waterfall.imgDetails;
  const assets = [];
  if (details.listingImageUrl && details.listingImageFilename) {
    assets.push({ url: details.listingImageUrl, filename: details.listingImageFilename, kind: 'listing' });
  }
  for (let i = 0; i < (details.imgUrl || []).length; i++) {
    assets.push({ url: details.imgUrl[i], filename: details.imgFilename[i], kind: 'thumbnail' });
  }
  for (let i = 0; i < (details.imgFullResUrl || []).length; i++) {
    assets.push({ url: details.imgFullResUrl[i], filename: details.imgFullResFilename[i], kind: 'full' });
  }

  for (let i = 0; i < assets.length; i++) {
    const { url, filename, kind } = assets[i];
    if (!url || !filename) continue;

    if (i > 0) await sleep(150);

    const result = await downloadImage(url, filename, { force });

    if (result.status === 'downloaded') {
      stats.downloaded++;
      if (verbose) console.log(`  Downloaded ${kind}: ${filename}`);
    } else if (result.status === 'skipped') {
      stats.skipped++;
      if (verbose) console.log(`  Skipped: ${filename} (already exists)`);
    } else {
      stats.failed++;
      if (verbose) console.log(`  Failed: ${filename} - ${result.error}`);
    }

    stats.details.push(result);
  }

  return stats;
}

function listCatalogAssets(records) {
  const assets = [];
  for (const record of records) {
    const details = record.imgDetails || {};
    if (details.listingImageUrl && details.listingImageFilename) {
      assets.push({ url: details.listingImageUrl, filename: details.listingImageFilename });
    }
    for (let i = 0; i < (details.imgUrl || []).length; i++) {
      if (details.imgUrl[i] && details.imgFilename?.[i]) {
        assets.push({
          url: details.imgUrl[i],
          filename: details.imgFilename[i],
          fallbackFilename: details.imgFullResFilename?.[i]
        });
      }
    }
    for (let i = 0; i < (details.imgFullResUrl || []).length; i++) {
      if (details.imgFullResUrl[i] && details.imgFullResFilename?.[i]) {
        assets.push({ url: details.imgFullResUrl[i], filename: details.imgFullResFilename[i] });
      }
    }
  }
  return [...new Map(assets.map(asset => [asset.filename, asset])).values()];
}

function reuseLegacyAssets(assets) {
  const basenameCounts = new Map();
  for (const asset of assets) {
    const basename = path.basename(asset.filename);
    basenameCounts.set(basename, (basenameCounts.get(basename) || 0) + 1);
  }
  let linked = 0;
  for (const asset of assets) {
    if (imageExists(asset.filename)) continue;
    const basename = path.basename(asset.filename);
    if (basenameCounts.get(basename) !== 1) continue;
    const legacyPath = resolveImagePath(basename);
    if (!fs.existsSync(legacyPath)) continue;
    const targetPath = resolveImagePath(asset.filename);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    try {
      fs.linkSync(legacyPath, targetPath);
    } catch {
      fs.copyFileSync(legacyPath, targetPath);
    }
    linked++;
  }
  return linked;
}

async function downloadCatalogImages(records, options = {}) {
  const assets = listCatalogAssets(records);
  const stats = {
    total: assets.length,
    reused: reuseLegacyAssets(assets),
    downloaded: 0,
    skipped: 0,
    failed: 0,
    sourceFallbacks: 0,
    failures: []
  };
  let nextIndex = 0;
  let processed = 0;
  async function worker() {
    while (nextIndex < assets.length) {
      const asset = assets[nextIndex++];
      let result;
      if (!options.force && imageExists(asset.filename)) {
        result = { status: 'skipped', filename: asset.filename, reason: 'exists' };
      } else {
        await sleep(options.delayMs ?? 75);
        result = await downloadImage(asset.url, asset.filename, options);
      }
      if (result.status === 'downloaded') stats.downloaded++;
      else if (result.status === 'skipped') stats.skipped++;
      else if (asset.fallbackFilename && imageExists(asset.fallbackFilename)) {
        const fallbackPath = resolveImagePath(asset.fallbackFilename);
        const targetPath = resolveImagePath(asset.filename);
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        try {
          fs.linkSync(fallbackPath, targetPath);
        } catch {
          fs.copyFileSync(fallbackPath, targetPath);
        }
        stats.sourceFallbacks++;
      }
      else {
        stats.failed++;
        stats.failures.push({ ...result, url: asset.url });
      }
      processed++;
      if (options.verbose && processed % 100 === 0) {
        console.log(`Assets ${processed}/${assets.length}: ${stats.downloaded} downloaded, ${stats.reused} reused, ${stats.failed} failed`);
      }
    }
  }
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 3, 4));
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return stats;
}

/**
 * Download full resolution images for a waterfall
 * @param {Object} waterfall - Waterfall data with imgDetails
 * @param {Object} options - Download options
 * @returns {Object} Statistics object
 */
async function downloadFullResImages(waterfall, options = {}) {
  const { force = false, verbose = false } = options;
  const stats = {
    downloaded: 0,
    skipped: 0,
    failed: 0,
    details: []
  };

  if (!waterfall.imgDetails || !waterfall.imgDetails.imgFullResUrl) {
    return stats;
  }

  const fullResUrls = waterfall.imgDetails.imgFullResUrl;
  const fullResFilenames = waterfall.imgDetails.imgFullResFilename || [];

  for (let i = 0; i < fullResUrls.length; i++) {
    const imageUrl = fullResUrls[i];

    // Add delay between requests
    if (i > 0) {
      await sleep(1000);
    }

    const filename = fullResFilenames[i] || imageUrl.split('/').pop();
    const result = await downloadImage(imageUrl, filename, { force });

    if (result.status === 'downloaded') {
      stats.downloaded++;
      if (verbose) console.log(`  Downloaded full-res: ${filename}`);
    } else if (result.status === 'skipped') {
      stats.skipped++;
      if (verbose) console.log(`  Skipped full-res: ${filename} (already exists)`);
    } else {
      stats.failed++;
      if (verbose) console.log(`  Failed full-res: ${filename} - ${result.error}`);
    }

    stats.details.push(result);
  }

  return stats;
}

/**
 * Verify all images in the database exist on disk
 * @param {Array} waterfalls - Array of waterfall data
 * @returns {Object} Verification results
 */
function verifyImages(waterfalls) {
  const results = {
    total: 0,
    exists: 0,
    missing: [],
    byWaterfall: []
  };

  for (const waterfall of waterfalls) {
    if (!waterfall.img_details) continue;

    let imgDetails;
    try {
      imgDetails = typeof waterfall.img_details === 'string'
        ? JSON.parse(waterfall.img_details)
        : waterfall.img_details;
    } catch {
      continue;
    }

    const waterfallMissing = [];

    const filenames = [
      imgDetails.listingImageFilename,
      ...(imgDetails.imgFilename || []),
      ...(imgDetails.imgFullResFilename || [])
    ].filter(Boolean);
    if (filenames.length) {
      for (const filename of filenames) {
        results.total++;
        if (imageExists(filename)) {
          results.exists++;
        } else {
          results.missing.push({ waterfall: waterfall.name, filename });
          waterfallMissing.push(filename);
        }
      }
    }

    if (waterfallMissing.length > 0) {
      results.byWaterfall.push({
        name: waterfall.name,
        url: waterfall.url,
        missing: waterfallMissing
      });
    }
  }

  return results;
}

/**
 * Get image statistics
 * @returns {Object} Statistics about local images
 */
function getImageStats() {
  const imagesDir = config.paths.images;

  if (!fs.existsSync(imagesDir)) {
    return { count: 0, size: 0 };
  }

  let totalSize = 0;
  let count = 0;
  const pending = [imagesDir];
  while (pending.length) {
    const directory = pending.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filepath = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(filepath);
      else if (entry.isFile()) {
        count++;
        totalSize += fs.statSync(filepath).size;
      }
    }
  }

  return {
    count,
    size: totalSize,
    sizeFormatted: formatBytes(totalSize)
  };
}

/**
 * Format bytes to human readable string
 * @param {number} bytes - Bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
  downloadImage,
  downloadWaterfallImages,
  downloadFullResImages,
  downloadCatalogImages,
  listCatalogAssets,
  imageExists,
  verifyImages,
  getImageStats,
  getFullResImageUrl
};
