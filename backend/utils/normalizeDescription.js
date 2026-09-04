const BLOCK_TAGS = [
  'address',
  'article',
  'aside',
  'blockquote',
  'br',
  'div',
  'figcaption',
  'footer',
  'h[1-6]',
  'header',
  'hr',
  'li',
  'main',
  'nav',
  'p',
  'pre',
  'section',
  'table',
  'td',
  'th',
  'tr'
].join('|');

const HTML_ENTITIES = {
  amp: '&',
  apos: "'",
  gt: '>',
  ldquo: '“',
  lsquo: '‘',
  lt: '<',
  mdash: '—',
  nbsp: ' ',
  ndash: '–',
  quot: '"',
  rdquo: '”',
  rsquo: '’'
};

function decodeHtmlEntities(value) {
  let decoded = value;

  // Multiple passes handle legacy values such as &amp;lt;p&amp;gt; safely.
  for (let pass = 0; pass < 4; pass += 1) {
    const next = decoded.replace(
      /&(?:#(\d+)|#x([\da-f]+)|([a-z][a-z\d]+));/gi,
      (entity, decimal, hexadecimal, named) => {
        if (decimal || hexadecimal) {
          const codePoint = parseInt(decimal || hexadecimal, decimal ? 10 : 16);
          if (Number.isFinite(codePoint) && codePoint <= 0x10ffff) {
            return String.fromCodePoint(codePoint);
          }
          return '';
        }

        return Object.prototype.hasOwnProperty.call(
          HTML_ENTITIES,
          named.toLowerCase()
        )
          ? HTML_ENTITIES[named.toLowerCase()]
          : entity;
      }
    );

    if (next === decoded) break;
    decoded = next;
  }

  return decoded;
}

function coerceDescription(value) {
  if (Array.isArray(value)) {
    return value
      .map(coerceDescription)
      .filter(Boolean)
      .join('\n\n');
  }

  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

/**
 * Convert legacy waterfall descriptions to safe, paragraph-separated text.
 * The result is plain text, not HTML, and is safe to render as text content.
 */
function normalizeDescription(value) {
  let description = coerceDescription(value);
  if (!description) return '';

  description = description
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .replace(/\r\n?|\u2028|\u2029/g, '\n')
    .replace(/\0/g, '')
    .replace(/[\u200b-\u200d\ufeff]/g, '');

  description = decodeHtmlEntities(description);

  // Remove elements whose contents should never be exposed, then turn other
  // block markup into paragraph boundaries before dropping remaining tags.
  description = description
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(
      /<(script|style|iframe|object|embed|svg|math|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
      ''
    )
    .replace(new RegExp(`<\\/?(?:${BLOCK_TAGS})\\b[^>]*>`, 'gi'), '\n\n')
    .replace(/<\/?[a-z][^>]*>/gi, '');

  description = description
    .replace(/\u00a0/g, ' ')
    .replace(/[\t\f\v ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    // The legacy scraper emitted () where paragraph-like elements were empty.
    .replace(/\s*\(\)\s*/g, '\n\n')
    // It also joined adjacent text nodes without whitespace. These two cases
    // recover high-confidence boundaries while leaving normal sentences alone.
    .replace(/([.!?]["'’”)]?)(?=[A-Z])/g, '$1\n\n')
    .replace(/([a-z])(?=(?:[A-Z][a-z]{2,}|[AI]\b))/g, '$1\n\n')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return description;
}

module.exports = {
  decodeHtmlEntities,
  normalizeDescription
};
