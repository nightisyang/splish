const fs = require('fs');
const path = require('path');

let waterfallMapCoords = [];

const fileObj = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'waterfalls.json'))
);

fileObj.forEach(el => {
  const [lat, long] = el.location.coordinates;
  const { name } = el;

  const markerArr = {
    title: name,
    coordinates: { latitude: lat, longitude: long }
  };

  console.log(markerArr);

  waterfallMapCoords.push(markerArr);
});

fs.writeFileSync(
  path.join(__dirname, 'waterfallMapCoords.json'),
  JSON.stringify(waterfallMapCoords),
  'utf-8'
);

// <Marker
//   title="test"
//   description="testing"
//   coordinate={{ latitude: 5.02017, longitude: 100.84717 }}
// />;

// const coordinateObj = { latitude: 0, longitude: 0 };

// const markerArr = {
//   title: '',
//   coordinate: { coordinateObj }
// };
