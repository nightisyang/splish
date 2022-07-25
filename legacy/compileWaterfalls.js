const fs = require('fs');
const path = require('path');

// compile all waterfalls info into single json
const files = fs.readdirSync(path.join(__dirname, 'data', 'waterfalls'));
let waterfalls = [];

files.forEach((objEl, i, arr) => {
  if (arr[i] === '.DS_Store') return;
  console.log(`Job counter : ${i} ${arr[i]}`);

  const file = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'waterfalls', `${arr[i]}`))
  );

  const {
    name,
    description,
    state,
    location,
    waterSource,
    waterfallProfile,
    accessibility,
    imgDetails,
    url
  } = file;

  const { decimalCoordinates } = location;

  const str1 = 'Check if you need a permit before planning a waterfall trip.';
  const str2 = 'More information hereWaterfalls can be dangerous ! ';
  const str3 = 'Always take care about your safetyVisitor Comments';

  let changeDescription = file.description;

  if (file.description.includes(str1)) {
    console.log('replacing str 1');

    changeDescription = file.description.replace(str1, '');
  }
  if (file.description.includes(str2)) {
    console.log('replacing str 2');

    changeDescription = file.description.replace(str2, '');
  }
  if (file.description.includes(str3)) {
    console.log('replacing str 3');

    changeDescription = file.description.replace(str3, '');
  }

  const formattedFile = {
    name,
    description: changeDescription,
    state,
    coordinates: { type: 'Point', decimalCoordinates },
    waterSource,
    waterfallProfile,
    accessibility,
    imgDetails,
    url
  };

  waterfalls.push(formattedFile);
});

fs.writeFileSync(
  path.join(__dirname, 'data', 'dev-data', 'waterfalls.json'),
  JSON.stringify(waterfalls),
  'utf-8'
);
console.log('Compilation completed');
// upload it to mongo
