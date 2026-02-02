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
  const filepath = path.join(config.paths.images, filename);
  return fs.existsSync(filepath);
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
  const filepath = path.join(config.paths.images, filename);

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
        timeout: 30000
      });

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);
        writer.on('error', reject);
        writer.on('finish', resolve);
      });

      return { status: 'downloaded', filename };
    } catch (err) {
      lastError = err;
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

  if (!waterfall.imgDetails || !waterfall.imgDetails.imgUrl) {
    return stats;
  }

  const { imgUrl, imgFilename } = waterfall.imgDetails;

  // Download thumbnail images
  for (let i = 0; i < imgUrl.length; i++) {
    const url = imgUrl[i];
    const filename = imgFilename[i] || url.split('/').pop();

    // Add delay between downloads
    if (i > 0) {
      await sleep(500);
    }

    const result = await downloadImage(url, filename, { force });

    if (result.status === 'downloaded') {
      stats.downloaded++;
      if (verbose) console.log(`  Downloaded: ${filename}`);
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

  for (let i = 0; i < fullResUrls.length; i++) {
    const pageUrl = fullResUrls[i];

    // Add delay between requests
    if (i > 0) {
      await sleep(1000);
    }

    // Get the actual image URL from the page
    const imageUrl = await getFullResImageUrl(pageUrl);
    if (!imageUrl) {
      stats.failed++;
      stats.details.push({ status: 'failed', url: pageUrl, error: 'Could not find image URL' });
      continue;
    }

    const filename = imageUrl.split('/').pop();
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

    if (imgDetails.imgFilename) {
      for (const filename of imgDetails.imgFilename) {
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

  const files = fs.readdirSync(imagesDir);
  let totalSize = 0;

  for (const file of files) {
    const filepath = path.join(imagesDir, file);
    const stat = fs.statSync(filepath);
    if (stat.isFile()) {
      totalSize += stat.size;
    }
  }

  return {
    count: files.length,
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
  imageExists,
  verifyImages,
  getImageStats,
  getFullResImageUrl
};
