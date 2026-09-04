/* eslint-disable no-console */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const source = require('../data/dev-data/waterfalls.json');
const curated = require('../data/descriptionParagraphs.json');
const { rowToWaterfall, WaterfallModel } = require('../db/sqlite');
const waterfallController = require('../controllers/waterfallController');

const EXPECTED_RECORD_COUNT = 186;

function canonicalContent(value) {
  return value
    .replace(/\(\)|\|heading_8\|/g, '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

function runController(handler, req) {
  return new Promise((resolve, reject) => {
    const res = {
      headers: {},
      statusCode: null,
      set(name, value) {
        this.headers[name] = value;
        return this;
      },
      status(statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      json(payload) {
        resolve({ headers: this.headers, statusCode: this.statusCode, payload });
        return this;
      }
    };

    handler(req, res, reject);
  });
}

const tests = [];
function test(name, run) {
  tests.push({ name, run });
}

test('covers every tracked source record exactly once by stable ID and name', () => {
  const sourceIds = source.map(record => record._id);
  const curatedIds = Object.keys(curated);

  assert.strictEqual(source.length, EXPECTED_RECORD_COUNT);
  assert.strictEqual(new Set(sourceIds).size, EXPECTED_RECORD_COUNT);
  assert.strictEqual(curatedIds.length, EXPECTED_RECORD_COUNT);
  assert.deepStrictEqual(curatedIds.slice().sort(), sourceIds.slice().sort());

  source.forEach(record => {
    assert.strictEqual(curated[record._id].name, record.name);
  });
});

test('preserves all source content apart from documented formatting artifacts', () => {
  source.forEach(record => {
    const joined = curated[record._id].paragraphs.join('');
    assert.strictEqual(
      canonicalContent(joined),
      canonicalContent(record.description),
      `${record._id} ${record.name}`
    );
  });
});

test('contains only non-empty plain-text paragraphs without legacy joins', () => {
  Object.entries(curated).forEach(([id, entry]) => {
    assert(Array.isArray(entry.paragraphs), id);
    assert(entry.paragraphs.length > 0, id);

    entry.paragraphs.forEach(paragraph => {
      assert.strictEqual(typeof paragraph, 'string', id);
      assert.strictEqual(paragraph, paragraph.trim(), id);
      assert(paragraph.length > 0, id);
      assert(!/[\r\n\0]/.test(paragraph), `${id}: embedded control/newline`);
      assert(!/<\/?[a-z][^>]*>/i.test(paragraph), `${id}: HTML`);
      assert(
        !/<(?:script|style|iframe|object|embed|svg|math)\b/i.test(paragraph),
        `${id}: executable markup`
      );
      assert(!/\(\)/.test(paragraph), `${id}: legacy empty marker`);
      assert(!/[a-z][.!?][A-Z]/.test(paragraph), `${id}: punctuation join`);
      assert(!/[a-z][A-Z][a-z]/.test(paragraph), `${id}: camel-case join`);
      assert(
        !/Image \d+(?=Image|[A-Z][a-z])/.test(paragraph),
        `${id}: image text-node join`
      );
      assert(
        !/\)(?=[A-Z][a-z])/.test(paragraph),
        `${id}: parenthetical text-node join`
      );
    });
  });
});

test('SQLite row serialization prefers current sanitized source text', () => {
  const sourceRecord = source[0];
  const waterfall = rowToWaterfall({
    id: 1,
    mongo_id: sourceRecord._id,
    name: sourceRecord.name,
    description: '<script>ignored()</script>word.The',
    state: sourceRecord.state,
    location_lng: 100,
    location_lat: 5,
    img_details: null
  });

  assert.deepStrictEqual(waterfall.descriptionParagraphs, ['word.', 'The']);
  assert.strictEqual(
    waterfall.description,
    waterfall.descriptionParagraphs.join('\n\n')
  );
  assert(!waterfall.description.includes('<script>'));
});

test('untracked rows retain safe plain-text fallback serialization', () => {
  const waterfall = rowToWaterfall({
    id: 999,
    mongo_id: 'untracked-id',
    name: 'Untracked Fall',
    description: '<p>First.</p><script>alert(1)</script><p>Second.</p>',
    state: 'Perak',
    location_lng: 100,
    location_lat: 5,
    img_details: null
  });

  assert.deepStrictEqual(waterfall.descriptionParagraphs, [
    'First.',
    'Second.'
  ]);
  assert.strictEqual(waterfall.description, 'First.\n\nSecond.');
});

test('list and detail controllers both expose description fields', async () => {
  const sourceRecord = source[0];
  const serialized = rowToWaterfall({
    id: 1,
    mongo_id: sourceRecord._id,
    name: sourceRecord.name,
    description: sourceRecord.description,
    state: sourceRecord.state,
    location_lng: 100,
    location_lat: 5,
    img_details: null
  });
  const originalFind = WaterfallModel.find;
  const originalFindById = WaterfallModel.findById;

  try {
    WaterfallModel.find = () => [serialized];
    WaterfallModel.findById = () => serialized;

    const list = await runController(waterfallController.getAllWaterfalls, {
      query: {}
    });
    const detail = await runController(waterfallController.getWaterfall, {
      params: { id: sourceRecord._id }
    });

    assert.match(list.headers['Cache-Control'], /max-age=300/);
    assert.match(detail.headers['Cache-Control'], /max-age=3600/);
    assert(list.headers['X-Splish-Catalog-Version']);
    assert(detail.headers['X-Splish-Catalog-Version']);

    const listItem = list.payload.data.waterfalls[0];
    const detailItem = detail.payload.data.waterfall;
    [listItem, detailItem].forEach(item => {
      assert(Array.isArray(item.descriptionParagraphs));
      assert.strictEqual(
        item.description,
        item.descriptionParagraphs.join('\n\n')
      );
    });
  } finally {
    WaterfallModel.find = originalFind;
    WaterfallModel.findById = originalFindById;
  }
});

test('tracked ambiguity notes identify stable source IDs', () => {
  const notes = fs.readFileSync(
    path.join(__dirname, '..', 'data', 'description-curation-review-notes.md'),
    'utf8'
  );
  const notedIds = [...notes.matchAll(/`([a-f0-9]{24})`/g)].map(
    match => match[1]
  );

  assert(notedIds.length > 0);
  notedIds.forEach(id => assert(curated[id], id));
});

(async () => {
  let failures = 0;

  await tests.reduce(
    (previous, { name, run }) =>
      previous.then(async () => {
        try {
          await run();
          console.log(`ok - ${name}`);
        } catch (error) {
          failures += 1;
          console.error(`not ok - ${name}`);
          console.error(error.stack);
        }
      }),
    Promise.resolve()
  );

  console.log(`\n${tests.length - failures}/${tests.length} tests passed`);
  if (failures > 0) process.exitCode = 1;
})();
