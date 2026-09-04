/* eslint-disable no-console */
const assert = require('assert');
const {
  decodeHtmlEntities,
  normalizeDescription
} = require('../utils/normalizeDescription');
const { rowToWaterfall } = require('../db/sqlite');

const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

test('preserves explicit paragraph breaks and normalizes whitespace', () => {
  assert.strictEqual(
    normalizeDescription(' First paragraph.\r\n\r\n Second   paragraph. '),
    'First paragraph.\n\nSecond paragraph.'
  );
});

test('converts safe HTML structure to plain-text paragraphs', () => {
  assert.strictEqual(
    normalizeDescription('<p>First &amp; second.</p><div>Next<br>line.</div>'),
    'First & second.\n\nNext\n\nline.'
  );
});

test('removes executable markup and dangerous element contents', () => {
  const result = normalizeDescription(
    '&lt;p&gt;Safe&lt;/p&gt;<script>alert(1)</script>' +
      '<img src=x onerror="alert(2)">Done.'
  );

  assert.strictEqual(result, 'Safe\n\nDone.');
  assert.strictEqual(/<\/?[a-z][^>]*>/i.test(result), false);
  assert.strictEqual(result.includes('alert('), false);
});

test('decodes numeric and common named HTML entities', () => {
  assert.strictEqual(
    decodeHtmlEntities('Rock &amp; water &#8212; &#x1f4a7;'),
    'Rock & water — 💧'
  );
});

test('recovers legacy concatenated paragraph boundaries', () => {
  assert.strictEqual(
    normalizeDescription(
      'Unknown regionJungle trekking needed!A Very tall CascadeThis is powerful.()Visit safely.'
    ),
    [
      'Unknown region',
      'Jungle trekking needed!',
      'A Very tall Cascade',
      'This is powerful.',
      'Visit safely.'
    ].join('\n\n')
  );
});

test('accepts legacy arrays and rejects object coercion', () => {
  assert.strictEqual(
    normalizeDescription(['First paragraph.', 'Second paragraph.']),
    'First paragraph.\n\nSecond paragraph.'
  );
  assert.strictEqual(normalizeDescription({ text: '<b>unsafe</b>' }), '');
  assert.strictEqual(normalizeDescription(null), '');
});

test('is idempotent', () => {
  const once = normalizeDescription('<p>First.</p><p>Second.</p>');
  assert.strictEqual(normalizeDescription(once), once);
});

test('normalizes the description while mapping SQLite rows for API output', () => {
  const waterfall = rowToWaterfall({
    id: 7,
    mongo_id: 'legacy-id',
    name: 'Test Fall',
    description: '<p>First.</p><script>alert(1)</script><p>Second.</p>',
    state: 'Perak',
    location_lng: 100.1,
    location_lat: 4.2,
    img_details: null
  });

  assert.strictEqual(waterfall._id, 'legacy-id');
  assert.strictEqual(waterfall.description, 'First.\n\nSecond.');
});

let failures = 0;

tests.forEach(({ name, run }) => {
  try {
    run();
    console.log(`ok - ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`not ok - ${name}`);
    console.error(error.stack);
  }
});

console.log(`\n${tests.length - failures}/${tests.length} tests passed`);
if (failures > 0) process.exitCode = 1;
