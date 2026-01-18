const cheerio = require('cheerio');
const config = require('../config');
const { parseCoordinates } = require('./gpsConverter');

/**
 * Parse the waterfall name from HTML
 * @param {CheerioAPI} $ - Cheerio instance
 * @returns {string} Waterfall name
 */
function parseName($) {
  const title = $('title').text().trim();
  return title || null;
}

/**
 * Parse the details table from HTML
 * @param {CheerioAPI} $ - Cheerio instance
 * @returns {Object} Parsed details object
 */
function parseDetails($) {
  const details = {
    state: null,
    location: null,
    coordinates: null,
    waterSource: null,
    waterfallProfile: null,
    accessibility: null
  };

  const tableHeaders = [
    'State',
    'Location',
    'Coordinates and map',
    'Water Source',
    'Waterfall Profile',
    'Accessibility'
  ];

  const headerToKey = {
    'State': 'state',
    'Location': 'location',
    'Coordinates and map': 'coordinates',
    'Water Source': 'waterSource',
    'Waterfall Profile': 'waterfallProfile',
    'Accessibility': 'accessibility'
  };

  // Extract table rows
  const tableData = [];
  $('tr').each(function() {
    const text = $(this).find('font').text().trim();
    if (text) {
      tableData.push(text);
    }
  });

  // Skip first row (usually header) and process detail rows
  const dataRows = tableData.slice(1, 7);

  dataRows.forEach((rowText, i) => {
    const header = tableHeaders[i];
    if (header && headerToKey[header]) {
      // Remove the header text from the value
      let value = rowText;
      if (rowText.startsWith(header)) {
        value = rowText.substring(header.length).trim();
      }

      const key = headerToKey[header];
      details[key] = value || null;
    }
  });

  // Parse coordinates into GeoJSON format
  if (details.coordinates) {
    const parsed = parseCoordinates(details.coordinates);
    if (parsed) {
      details.parsedLocation = parsed;
    }
  }

  return details;
}

/**
 * Parse images from HTML
 * @param {CheerioAPI} $ - Cheerio instance
 * @returns {Object} Image details object
 */
function parseImages($) {
  const imgFilename = [];
  const imgUrl = [];
  const imgFullResUrl = [];

  $('td').each(function() {
    // Get thumbnail images
    const imgSrc = $(this).find('img').attr('src');
    if (imgSrc && imgSrc !== config.skipImageUrl) {
      if (!imgUrl.includes(imgSrc)) {
        imgUrl.push(imgSrc);
        const filename = imgSrc.split('/').pop();
        imgFilename.push(filename);
      }
    }

    // Get full resolution image links
    const href = $(this).find('a').attr('href');
    if (href && href.includes('image.php?database')) {
      if (!imgFullResUrl.includes(href)) {
        imgFullResUrl.push(href);
      }
    }
  });

  // Parse image descriptions
  const imgDesc = [];
  $('font', 'p').each(function() {
    const text = $(this).text().trim();
    if (text) {
      imgDesc.push(text);
    }
  });

  // Remove last 6 items which are typically boilerplate
  const cleanedImgDesc = imgDesc.slice(0, -6);

  return {
    imgFilename,
    imgUrl,
    imgFullResUrl,
    imgDesc: cleanedImgDesc
  };
}

/**
 * Parse the description from HTML
 * @param {CheerioAPI} $ - Cheerio instance
 * @param {Array} imgDesc - Image descriptions to remove from text
 * @returns {string} Cleaned description
 */
function parseDescription($, imgDesc = []) {
  // Get raw text from paragraphs in table
  const rawText = $('tr').find('p').text();

  // Clean up whitespace
  const words = rawText.split(' ');
  const cleanedWords = words
    .map(word => word.trim().replace(/\n+|\s+/g, ''))
    .filter(word => word !== '');

  let description = cleanedWords.join(' ');

  // Remove image descriptions from the description
  imgDesc.forEach(desc => {
    description = description.replace(desc, '');
  });

  // Remove boilerplate strings
  config.boilerplateStrings.forEach(str => {
    description = description.replace(str, '');
  });

  return description.trim();
}

/**
 * Parse a waterfall page HTML into structured data
 * @param {string} html - Raw HTML content
 * @param {string} url - The page URL
 * @returns {Object|null} Parsed waterfall data or null on failure
 */
function parseWaterfallPage(html, url) {
  try {
    const $ = cheerio.load(html);

    const name = parseName($);
    if (!name) {
      return null;
    }

    const details = parseDetails($);
    const imgDetails = parseImages($);
    const description = parseDescription($, imgDetails.imgDesc);

    // Build the waterfall object
    const waterfall = {
      name,
      description,
      state: details.state,
      waterSource: details.waterSource,
      waterfallProfile: details.waterfallProfile,
      accessibility: details.accessibility,
      location: details.parsedLocation || null,
      imgDetails: {
        imgFilename: imgDetails.imgFilename,
        imgUrl: imgDetails.imgUrl,
        imgDesc: imgDetails.imgDesc
      },
      url
    };

    return waterfall;
  } catch (err) {
    console.error(`Error parsing ${url}:`, err.message);
    return null;
  }
}

/**
 * Parse state listing page to extract waterfall URLs
 * @param {string} html - Raw HTML content
 * @returns {Array} Array of waterfall URLs
 */
function parseStatePage(html) {
  const $ = cheerio.load(html);
  const urls = [];

  $('tr').each(function() {
    const href = $(this).find('a').attr('href');
    if (href && href.endsWith('.php') && !href.includes('state.php')) {
      if (!urls.includes(href)) {
        urls.push(href);
      }
    }
  });

  return urls;
}

/**
 * Check if a page likely needs Claude CLI parsing
 * @param {Object} parsed - Parsed result
 * @param {string} url - Page URL
 * @returns {boolean} True if Claude parsing is needed
 */
function needsClaudeParsing(parsed, url) {
  // Check if URL is in known problematic list
  const filename = url.split('/').pop();
  if (config.problematicPages.includes(filename)) {
    return true;
  }

  // Check if parsing failed or is incomplete
  if (!parsed) return true;
  if (!parsed.name) return true;
  if (!parsed.description || parsed.description.length < 20) return true;
  if (!parsed.state) return true;

  return false;
}

module.exports = {
  parseWaterfallPage,
  parseStatePage,
  needsClaudeParsing,
  parseName,
  parseDetails,
  parseImages,
  parseDescription
};
