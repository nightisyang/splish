const fs = require('fs');
const path = require('path');

const waterfallMapCoords = [];

const fileObj = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'waterfalls.json'))
);

// console.log(fileObj.length);

fileObj.forEach(el => {
  const [lat, long] = el.location.coordinates;
  const { name, _id } = el;

  const markerArr = {
    title: name,
    coordinates: { latitude: lat, longitude: long },
    id: _id
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
