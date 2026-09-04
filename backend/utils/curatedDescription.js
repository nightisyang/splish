const curatedDescriptions = require('../data/descriptionParagraphs.json');
const { normalizeDescription } = require('./normalizeDescription');

function fallbackParagraphs(value) {
  const description = normalizeDescription(value);
  return description ? description.split('\n\n') : [];
}

/**
 * Resolve the API description fields without depending on SQLite contents.
 * Tracked source records use the reviewed artifact; dynamically-created rows
 * retain the safe legacy normalization fallback.
 */
function getDescriptionFields(id, legacyDescription) {
  const curated = curatedDescriptions[id];
  const sourceParagraphs = fallbackParagraphs(legacyDescription);
  // Fresh scraper output is validated and paragraph-separated before database
  // promotion. The historical curation remains only as a fallback for an empty
  // legacy row; otherwise it would hide future source corrections indefinitely.
  const descriptionParagraphs = sourceParagraphs.length
    ? sourceParagraphs
    : curated?.paragraphs.slice() || [];

  return {
    description: descriptionParagraphs.join('\n\n'),
    descriptionParagraphs
  };
}

module.exports = {
  curatedDescriptions,
  getDescriptionFields
};
