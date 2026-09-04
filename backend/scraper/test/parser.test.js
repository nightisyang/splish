const test = require('node:test');
const assert = require('node:assert/strict');
const { parseMapEntries, parseStateEntries, parseWaterfallPage } = require('../lib/parser');
const { assessRecord } = require('../lib/quality');
const { parseCoordinates } = require('../lib/gpsConverter');
const { canonicalName, chooseExisting, stableSourceId } = require('../lib/promote');
const { contentType, storageConfig, validateStorageConfig } = require('../lib/objectStorage');

test('detail parser reads semantic labels and keeps narrative separate from images', () => {
  const html = `
    <html><body><div class="box">Ayer Example</div><center><table><tr><td>
      <p><table class="infor"><tbody>
        <tr><td><b>State</b></td><td>Malacca</td></tr>
        <tr><td><b>Location</b></td><td>N 02 20.627 E 102 37.084</td></tr>
        <tr><td><b>Coordinates and Map</b></td><td>Near Example Town</td></tr>
        <tr><td><b>Water Source</b></td><td>Example River</td></tr>
        <tr><td><b>Waterfall Profile</b></td><td>Cascade</td></tr>
        <tr><td><b>Accessibility</b></td><td>Easy walk</td></tr>
      </tbody></table></p>
      <p>First factual paragraph about the approach.</p>
      <table><tr><td><a href="image.php?database=ayer&picname=fall.jpg"><img src="images/ayer/tn/TNfall.jpg"></a>Image caption</td></tr></table>
      <p>Second factual paragraph about the waterfall.</p>
      <p>You are welcome to send a comment about this waterfall.</p>
    </td></tr></table></center></body></html>`;
  const record = parseWaterfallPage(html, '1example.php');

  assert.equal(record.state, 'Melaka');
  assert.equal(record.locality, 'Near Example Town');
  assert.equal(record.coordinateSource, 'location');
  assert.deepEqual(record.location.coordinates.map(value => Number(value.toFixed(5))), [102.61807, 2.34378]);
  assert.equal(record.description, 'First factual paragraph about the approach.\n\nSecond factual paragraph about the waterfall.');
  assert.deepEqual(record.imgDetails.imgDesc, ['Image caption']);
  assert.deepEqual(record.imgDetails.imgFilename, ['thumb/ayer/TNfall.jpg']);
  assert.deepEqual(record.imgDetails.imgFullResFilename, ['full/ayer/fall.jpg']);
  assert.deepEqual(record.imgDetails.imgFullResUrl, ['https://waterfallsofmalaysia.com/images/ayer/fall.jpg']);
});

test('state parser extracts listing metadata and normalizes state names', () => {
  const html = `
    <table>
      <tr><td colspan="5">Accessability: Moderate</td></tr>
      <tr>
        <td><img src="images/database/example.jpg"></td>
        <td><a href="123example.php">Example Falls</a><br>Example District</td>
        <td>Cascade</td><td>Swimming</td>
        <td>A quiet forest waterfall. No Permit needed Last update February 2026</td>
      </tr>
    </table>`;
  const [entry] = parseStateEntries(html, { stateId: 4, stateName: 'Malacca' });

  assert.equal(entry.difficulty, 'Moderate');
  assert.equal(entry.state, 'Melaka');
  assert.equal(entry.locality, 'Example District');
  assert.equal(entry.summary, 'A quiet forest waterfall.');
  assert.equal(entry.lastUpdate, 'February 2026');
  assert.equal(entry.listingImageFilename, 'listing/4/example.jpg');
});

test('quality validation rejects misaligned image arrays', () => {
  const result = assessRecord({
    name: 'Example', state: 'Perak', url: 'example.php',
    description: 'A sufficiently long factual description of an example waterfall and the route used to reach it.',
    location: { coordinates: [101, 4] },
    imgDetails: {
      imgUrl: ['thumb.jpg'], imgFilename: ['thumb.jpg'], imgDesc: [],
      imgFullResUrl: ['full.jpg'], imgFullResFilename: ['full.jpg']
    }
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('image_arrays_misaligned'));
});

test('GPS parser supports source degree-minute variants in either order', () => {
  assert.deepEqual(
    parseCoordinates("East 103 14' North 02 27' (Takah Tinggi)").coordinates.map(value => Number(value.toFixed(5))),
    [103.23333, 2.45]
  );
  assert.deepEqual(
    parseCoordinates("N05� 44.52' E102� 22.54'").coordinates.map(value => Number(value.toFixed(5))),
    [102.37567, 5.742]
  );
  assert.deepEqual(
    parseCoordinates("E101° 37.19' N 3° 18.13'").coordinates.map(value => Number(value.toFixed(5))),
    [101.61983, 3.30217]
  );
  assert.equal(parseCoordinates('N4 34.61 E101 114.00'), null);
});

test('map parser provides deterministic coordinate fallbacks', () => {
  const html = `
    var marker = L.marker([3.595, 101.751], {icon:orangeIcon}).addTo(map)
      .bindPopup('<b><a href=https://waterfallsofmalaysia.com/51chiling.php><img src=/images/database/51chiling.jpg><br>Chiling Falls</a></b>');`;
  assert.deepEqual(parseMapEntries(html), [{
    url: '51chiling.php',
    name: 'Chiling Falls',
    location: {
      type: 'Point',
      coordinates: [101.751, 3.595],
      verbatimCoordinates: '3.595, 101.751'
    }
  }]);
});

test('promotion reconciliation repairs a duplicate legacy URL by name', () => {
  const existing = [
    { id: 108, name: 'Lata Tengkoh Penyel', url: '50pisang.php' },
    { id: 136, name: 'Pisang Waterfall', url: '50pisang.php' }
  ];
  const claimed = new Set();
  const penyel = chooseExisting({ name: 'Lata Tengkoh Penyel', url: '171penyel.php' }, existing, claimed);
  claimed.add(penyel.id);
  const pisang = chooseExisting({ name: 'Pisang Fall', url: '50pisang.php' }, existing, claimed);

  assert.equal(canonicalName('The Pisang Waterfall'), 'pisang');
  assert.equal(penyel.id, 108);
  assert.equal(pisang.id, 136);
  assert.equal(stableSourceId('1example.php'), stableSourceId('1example.php'));
});

test('object storage configuration is provider-neutral and validates secrets', () => {
  const settings = storageConfig({
    R2_ENDPOINT: 'https://account.example.invalid',
    R2_BUCKET: 'splish',
    R2_ACCESS_KEY_ID: 'access',
    R2_SECRET_ACCESS_KEY: 'secret',
    R2_PUBLIC_BASE_URL: 'https://assets.example.com/'
  });
  assert.doesNotThrow(() => validateStorageConfig(settings));
  assert.equal(settings.publicBaseUrl, 'https://assets.example.com');
  assert.equal(contentType('photo.JPG'), 'image/jpeg');
  assert.throws(() => validateStorageConfig(storageConfig({})), /R2_ENDPOINT/);
});
