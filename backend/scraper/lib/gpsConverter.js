const convert = require('geo-coordinates-parser');

/**
 * Convert various coordinate formats to decimal degrees
 * @param {string} coordinateString - Raw coordinate string from website
 * @returns {Object|null} Object with coordinates array [lng, lat] or null if conversion fails
 */
function parseCoordinates(coordinateString) {
  if (!coordinateString || coordinateString.trim() === '') {
    return null;
  }

  // Clean up the coordinate string
  let cleaned = coordinateString.trim();

  // Remove common prefixes/suffixes that might cause parsing issues
  cleaned = cleaned.replace(/^coordinates?:?\s*/i, '');
  cleaned = cleaned.replace(/\s*\(.*\)$/, ''); // Remove trailing parenthetical notes

  try {
    const result = convert(cleaned);

    // geo-coordinates-parser returns { decimalLatitude, decimalLongitude, verbatimCoordinates, ... }
    if (result && typeof result.decimalLatitude === 'number' && typeof result.decimalLongitude === 'number') {
      // Validate coordinates are within Malaysia's approximate bounds
      const lat = result.decimalLatitude;
      const lng = result.decimalLongitude;

      // Malaysia bounds: roughly 0° to 8° N latitude, 99° to 120° E longitude
      if (lat >= 0 && lat <= 10 && lng >= 99 && lng <= 120) {
        return {
          type: 'Point',
          coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
          verbatimCoordinates: result.verbatimCoordinates || cleaned
        };
      } else {
        // Coordinates parsed but outside Malaysia - might be swapped
        // Try swapping lat/lng
        if (lng >= 0 && lng <= 10 && lat >= 99 && lat <= 120) {
          return {
            type: 'Point',
            coordinates: [lat, lng], // Swapped
            verbatimCoordinates: result.verbatimCoordinates || cleaned
          };
        }
      }
    }
  } catch (err) {
    // Parsing failed, try alternative approaches
  }

  // Try manual parsing for common formats
  return parseManually(cleaned);
}

/**
 * Manual parsing for edge cases the library doesn't handle
 * @param {string} str - Coordinate string
 * @returns {Object|null} Parsed coordinates or null
 */
function parseManually(str) {
  // Format: "N 5° 12' 34.5", E 100° 23' 45.6""
  const dmsPattern = /([NS])\s*(\d+)[°\s]+(\d+)['\s]+(\d+\.?\d*)["\s]*,?\s*([EW])\s*(\d+)[°\s]+(\d+)['\s]+(\d+\.?\d*)/i;
  let match = str.match(dmsPattern);

  if (match) {
    let lat = parseInt(match[2]) + parseInt(match[3]) / 60 + parseFloat(match[4]) / 3600;
    let lng = parseInt(match[6]) + parseInt(match[7]) / 60 + parseFloat(match[8]) / 3600;

    if (match[1].toUpperCase() === 'S') lat = -lat;
    if (match[5].toUpperCase() === 'W') lng = -lng;

    return {
      type: 'Point',
      coordinates: [lng, lat],
      verbatimCoordinates: str
    };
  }

  // Format: "5.123, 100.456" or "5.123,100.456"
  const decimalPattern = /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/;
  match = str.match(decimalPattern);

  if (match) {
    const first = parseFloat(match[1]);
    const second = parseFloat(match[2]);

    // Determine which is lat and which is lng based on Malaysia's location
    let lat, lng;
    if (Math.abs(first) < Math.abs(second)) {
      // First is likely latitude (smaller number for Malaysia)
      lat = first;
      lng = second;
    } else {
      lat = second;
      lng = first;
    }

    // Validate
    if (lat >= 0 && lat <= 10 && lng >= 99 && lng <= 120) {
      return {
        type: 'Point',
        coordinates: [lng, lat],
        verbatimCoordinates: str
      };
    }
  }

  return null;
}

/**
 * Format coordinates for display
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @returns {string} Formatted string
 */
function formatCoordinates(lng, lat) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
}

module.exports = {
  parseCoordinates,
  formatCoordinates
};
