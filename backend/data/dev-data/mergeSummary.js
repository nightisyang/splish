const fs = require('fs');
const path = require('path');

const waterfallCompiled = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'waterfalls.json'))
);

const waterfallSummary = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'waterfallSummary.json'))
);

const notMerged = [];

for (let i = 0; i < waterfallCompiled.length; i++) {
  const { url: urlCompiled } = waterfallCompiled[i];

  console.log(`Task completed: ${i + 1}/${waterfallCompiled.length}`);
  console.log(urlCompiled);

  for (let n = 0; n < waterfallSummary.length; n++) {
    const { URL: urlSummary } = waterfallSummary[n];
    // console.log(urlSummary);

    if (urlCompiled === urlSummary) {
      console.log(`${waterfallCompiled[i].name} matched!`);
      waterfallCompiled[i].locality = waterfallSummary[n].Locality;
      waterfallCompiled[i].summary = waterfallSummary[n].Description;
      waterfallCompiled[i].lastUpdate = waterfallSummary[n].Lastupdate;
      waterfallCompiled[i].difficulty = waterfallSummary[n].Accessability;
    }
  }

  if (!waterfallCompiled[i].locality) {
    notMerged.push(waterfallCompiled[i].name);
  }
}

console.log('Waterfalls not merged', notMerged);

fs.writeFileSync(
  path.join(__dirname, 'waterfalls.json'),
  JSON.stringify(waterfallCompiled),
  'utf-8'
);
