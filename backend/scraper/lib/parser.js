const cheerio = require('cheerio');
const config = require('../config');
const { parseCoordinates } = require('./gpsConverter');

const DETAIL_LABELS = {
  state: 'state',
  location: 'locality',
  'coordinates and map': 'coordinates',
  'water source': 'waterSource',
  'waterfall profile': 'waterfallProfile',
  accessibility: 'accessibility'
};

const STATE_ALIASES = {
  johore: 'Johor',
  johor: 'Johor',
  malacca: 'Melaka',
  melaka: 'Melaka',
  'negri sembilan': 'Negeri Sembilan',
  'negeri sembilan': 'Negeri Sembilan',
  penang: 'Pulau Penang',
  'pulau penang': 'Pulau Penang'
};

const DESCRIPTION_STOP_MARKERS = [
  '"Rubbish exist when there is an imbalance',
  'If you plan to visit this waterfall',
  'You are welcome to send a comment',
  'Nowadays you need a permit',
  'Present situation for ',
  'Waterfalls can be dangerous'
];

function normalizeText(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\t\r ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
}

function normalizeState(value) {
  const clean = normalizeText(value);
  return STATE_ALIASES[clean.toLowerCase()] || clean;
}

function absoluteUrl(value) {
  if (!value) return null;
  try {
    return new URL(value, `${config.baseUrl}/`).toString().replace(/^http:/, 'https:');
  } catch {
    return null;
  }
}

function parseName($) {
  return normalizeText($('.box').first().text()) || normalizeText($('title').first().text()) || null;
}

function directRows($, table) {
  return table.children('tbody').children('tr').add(table.children('tr'));
}

function findDetailsTable($) {
  let best = null;
  let bestScore = 0;
  let bestNestedTableCount = Infinity;
  $('table').each(function() {
    const table = $(this);
    const labels = directRows($, table).map((_, row) => {
      const firstCell = $(row).children('td').first();
      return normalizeText(firstCell.find('b').first().text()).toLowerCase();
    }).get();
    const score = labels.filter(label => DETAIL_LABELS[label]).length;
    const nestedTableCount = table.find('table').length;
    if (score > bestScore || (score === bestScore && nestedTableCount < bestNestedTableCount)) {
      best = table;
      bestScore = score;
      bestNestedTableCount = nestedTableCount;
    }
  });
  return bestScore >= 4 ? best : null;
}

function parseDetails($) {
  const details = {
    accessibility: null,
    coordinateSource: null,
    coordinates: null,
    locality: null,
    parsedLocation: null,
    state: null,
    waterfallProfile: null,
    waterSource: null
  };
  const table = findDetailsTable($);
  if (!table) return { ...details, table: null };

  directRows($, table).each(function() {
    const cells = $(this).children('td');
    if (cells.length < 2) return;
    const label = normalizeText(cells.eq(0).text()).toLowerCase();
    const key = DETAIL_LABELS[label];
    if (!key) return;
    details[key] = normalizeText(cells.eq(1).text()) || null;
  });

  details.state = normalizeState(details.state);
  const coordinateCandidates = [
    ['coordinates', details.coordinates],
    ['location', details.locality]
  ];
  for (const [source, value] of coordinateCandidates) {
    const parsed = parseCoordinates(value);
    if (!parsed) continue;
    details.parsedLocation = parsed;
    details.coordinateSource = source;
    if (source === 'location' && details.coordinates) {
      details.locality = details.coordinates;
    }
    break;
  }

  return { ...details, table };
}

function imageIdentity(href) {
  try {
    const imagePage = new URL(href, `${config.baseUrl}/`);
    const database = imagePage.searchParams.get('database');
    const originalFilename = imagePage.searchParams.get('picname');
    if (!database || !originalFilename) return null;
    return {
      database,
      originalFilename,
      fullUrl: absoluteUrl(`/images/${database}/${originalFilename}`),
      fullFilename: `full/${database}/${originalFilename}`
    };
  } catch {
    return null;
  }
}

function parseImages($) {
  const images = [];
  $('a').each(function() {
    const anchor = $(this);
    const image = anchor.find('img').first();
    const href = anchor.attr('href');
    const thumbSrc = image.attr('src');
    if (!href || !thumbSrc || !href.includes('image.php?database')) return;
    const identity = imageIdentity(href);
    const thumbUrl = absoluteUrl(thumbSrc);
    if (!identity || !thumbUrl || thumbUrl === config.skipImageUrl) return;
    if (images.some(item => item.fullUrl === identity.fullUrl)) return;

    const thumbBasename = new URL(thumbUrl).pathname.split('/').pop();
    const cell = anchor.closest('td').clone();
    cell.find('a, img').remove();
    const caption = normalizeText(cell.text());
    images.push({
      caption,
      fullFilename: identity.fullFilename,
      fullUrl: identity.fullUrl,
      thumbFilename: `thumb/${identity.database}/${thumbBasename}`,
      thumbUrl
    });
  });

  return {
    imgDesc: images.map(item => item.caption),
    imgFilename: images.map(item => item.thumbFilename),
    imgFullResFilename: images.map(item => item.fullFilename),
    imgFullResUrl: images.map(item => item.fullUrl),
    imgUrl: images.map(item => item.thumbUrl)
  };
}

function textBlocksFromHtml(html) {
  const marked = String(html || '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|td|tr|li)>/gi, '\n\n');
  const text = cheerio.load(`<div>${marked}</div>`).root().text();
  return text
    .split(/\n{2,}/)
    .map(normalizeText)
    .filter(Boolean);
}

function truncateBoilerplate(value) {
  let text = value;
  for (const marker of DESCRIPTION_STOP_MARKERS) {
    const index = text.toLowerCase().indexOf(marker.toLowerCase());
    if (index >= 0) text = text.slice(0, index);
  }
  return normalizeText(text.replace(/\|heading_\d+\|/gi, ''));
}

function parseDescription($, detailsTable = findDetailsTable($)) {
  if (!detailsTable) return '';
  const blocks = [];
  // The legacy pages wrap their information table in a paragraph. Narrative
  // paragraphs are siblings of that wrapper, rather than of the table itself.
  const contentAnchor = detailsTable.closest('p');
  const siblings = (contentAnchor.length ? contentAnchor : detailsTable).nextAll().toArray();

  for (const sibling of siblings) {
    const node = $(sibling).clone();
    if (node.is('script, style, noscript')) continue;
    if (node.find('a[href^="mailto:"]').length || node.is('img[src*="waterfalls02_small"]')) break;

    node.find('td').each(function() {
      if ($(this).find('a[href*="image.php?database"] img').length) $(this).remove();
    });
    node.find('script, style, noscript, img').remove();

    for (const candidate of textBlocksFromHtml($.html(node))) {
      const clean = truncateBoilerplate(candidate);
      if (!clean) continue;
      if (config.boilerplateStrings.some(value => clean === normalizeText(value))) continue;
      blocks.push(clean);
    }
  }

  return [...new Set(blocks)].join('\n\n').trim();
}

function parseWaterfallPage(html, url) {
  try {
    const $ = cheerio.load(html);
    const name = parseName($);
    if (!name) return null;
    const details = parseDetails($);
    const imgDetails = parseImages($);
    return {
      name,
      description: parseDescription($, details.table),
      state: details.state,
      locality: details.locality,
      waterSource: details.waterSource,
      waterfallProfile: details.waterfallProfile,
      accessibility: details.accessibility,
      location: details.parsedLocation,
      coordinateSource: details.coordinateSource,
      imgDetails,
      url
    };
  } catch (error) {
    console.error(`Error parsing ${url}:`, error.message);
    return null;
  }
}

function parseListingSummary(cell) {
  const text = normalizeText(cell.text()).replace(/\n/g, ' ');
  const lastUpdateMatch = text.match(/Last update\s+(.+)$/i);
  const lastUpdate = lastUpdateMatch ? normalizeText(lastUpdateMatch[1]) : null;
  const summary = normalizeText(text
    .replace(/(?:No\s+Permit needed|Permit needed|Permit \?\?|No information available).*$/i, '')
    .replace(/Last update\s+.+$/i, ''));
  return { lastUpdate, summary: summary || null };
}

function parseStateEntries(html, options = {}) {
  const $ = cheerio.load(html);
  const entries = [];
  let difficulty = null;

  $('tr').each(function() {
    const row = $(this);
    const rowText = normalizeText(row.text());
    const accessMatch = rowText.match(/Access(?:a|i)bility:\s*(Easy|Moderate|Difficult)/i);
    if (accessMatch) {
      difficulty = accessMatch[1][0].toUpperCase() + accessMatch[1].slice(1).toLowerCase();
      return;
    }

    const cells = row.children('td');
    const link = cells.eq(1).find('a[href$=".php"]').first();
    const url = link.attr('href');
    if (!url || cells.length < 5) return;

    const localityCell = cells.eq(1).clone();
    localityCell.find('a').remove();
    const listingImage = absoluteUrl(cells.eq(0).find('img').attr('src'));
    const listing = parseListingSummary(cells.eq(4));
    const listingBasename = listingImage ? new URL(listingImage).pathname.split('/').pop() : null;
    entries.push({
      difficulty,
      lastUpdate: listing.lastUpdate,
      listingImageFilename: listingBasename ? `listing/${options.stateId || 'unknown'}/${listingBasename}` : null,
      listingImageUrl: listingImage,
      locality: normalizeText(localityCell.text()) || null,
      name: normalizeText(link.text()) || null,
      state: normalizeState(options.stateName || ''),
      summary: listing.summary,
      url
    });
  });

  const unique = new Map();
  for (const entry of entries) unique.set(entry.url, entry);
  return [...unique.values()];
}

function parseStatePage(html) {
  return parseStateEntries(html).map(entry => entry.url);
}

function parseMapEntries(html) {
  const entries = [];
  const pattern = /L\.marker\(\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\][\s\S]*?bindPopup\([\s\S]*?<a\s+href=(?:["']?)https?:\/\/waterfallsofmalaysia\.com\/([^\s>"']+\.php)[\s\S]*?<br>([^<]+)<\/a>/gi;
  let match;
  while ((match = pattern.exec(String(html || '')))) {
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (latitude < 0 || latitude > 10 || longitude < 99 || longitude > 120) continue;
    entries.push({
      url: match[3],
      name: normalizeText(match[4]),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        verbatimCoordinates: `${latitude}, ${longitude}`
      }
    });
  }
  return entries;
}

function needsLlmReview(parsed) {
  if (!parsed || !parsed.name || !parsed.state) return false;
  const description = parsed.description || '';
  return description.length >= 80 && (
    /\|heading_\d+\||Visitor Comments|rmb_ki\d+/i.test(description) ||
    (description.length > 1800 && !description.includes('\n\n'))
  );
}

module.exports = {
  absoluteUrl,
  findDetailsTable,
  needsLlmReview,
  normalizeState,
  normalizeText,
  parseDescription,
  parseDetails,
  parseImages,
  parseMapEntries,
  parseName,
  parseStateEntries,
  parseStatePage,
  parseWaterfallPage
};
