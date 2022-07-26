const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.port || 3000;

app.listen(PORT, () => {
  console.log(`server is running on PORT:${PORT}`);
});

const filePath = path.join(__dirname, 'data');
const stateArr = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Malacca',
  'Negri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Penang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu'
];

// eslint-disable-next-line node/no-unsupported-features/es-syntax
async function downloadImage(url, filepath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on('error', reject)
      .once('close', () => {
        resolve(filepath);
        console.log('Download completed!');
      });
  });
}

const url = JSON.parse(fs.readFileSync(`${filePath}/compiledURL.json`));
const filename = path.join(__dirname, 'data', 'waterfalls');
const missing = [
  '164ayerputeri.php',
  '98kotatinggi.php',
  '58ledang.php',
  '99pulai.php',
  '128takamelor.php',
  '159asahan.php',
  '161jeramtinggi.php'
];

let counter = 0;

// setInterval(() => {
// if (counter < url.length) {

missing.forEach(val => {
  let name;
  let description;
  let details = [];
  let imgDetails;
  let imgUrl = [];
  let imgDesc;

  try {
    axios(`https://waterfallsofmalaysia.com/${val}`).then(res => {
      const data = res.data;
      // console.log(data);
      const $ = cheerio.load(data);

      $('title', data).each(function(i, el) {
        name = $(this).text();
      });

      // const jsonObj = JSON.parse(
      //   fs.readFileSync(
      //     path.join(__dirname, "data", "waterfalls", `${name}.json`)
      //   )
      // );

      // if (!jsonObj) return;

      // jsonObj.url = url[counter];

      // fs.writeFileSync(
      //   path.join(__dirname, "data", "waterfalls", `${name}.json`),
      //   JSON.stringify(jsonObj)
      // );

      let tableTemp = [];
      $('tr', 'table', data).each(function() {
        tableTemp.push(
          $(this)
            .find('font')
            .text()
        );
      });

      const tableHeader = [
        'State',
        'Location',
        'Coordinates and map',
        'Water Source',
        'Waterfall Profile',
        'Accessibility'
      ];

      tableTemp.splice(1, 6).forEach((val, i) => {
        const header = tableHeader[i];
        const value = val.slice(header.length);

        let altHeader;

        if (header === 'Coordinates and map') {
          altHeader = 'coordinates';
        } else if (header === 'Water Source') {
          altHeader = 'waterSource';
        } else if (header === 'Waterfall Profile') {
          altHeader = 'waterfallProfile';
        } else {
          altHeader = header.toLowerCase();
        }
        details.push({ [`${altHeader}`]: value });
      });

      let imgFilename = [];
      $('td', data).each(function() {
        let imgUrltemp = $(this)
          .find('img')
          .attr('src');

        if (
          imgUrltemp !== undefined &&
          imgUrltemp !==
            'https://waterfallsofmalaysia.com/images/waterfalls01_small.jpg'
        ) {
          imgUrl.push(imgUrltemp);
          let filename = imgUrltemp.split('/').pop();
          imgFilename.push(filename);
          downloadImage(imgUrltemp, path.join(filePath, 'images', filename));
        }
      });

      let imgDescTemp = [];
      $('font', 'p', data).each(function() {
        const temp = $(this).text();

        imgDescTemp.push(temp);
      });
      imgDesc = imgDescTemp.slice(0, -6);

      imgDetails = {
        imgFilename: imgFilename,
        imgUrl: imgUrl,
        imgDesc: imgDesc
      };

      // $("td", data).each(function () {
      //   const summary = $(this).find("p").text();
      //   console.log(summary);
      // });
      const rawText = $('tr', 'table', data)
        .find('p')
        .text();

      const cleanUp = rawText.split(' ');

      cleanUp.forEach((str, i, arr) => {
        result = str.trim().replace(/\n+|\s/g, '');
        // console.log(result);
        arr[i] = result;
      });

      for (let i = cleanUp.length; i > -1; i--) {
        if (cleanUp[i] === '') cleanUp.splice(i, 1);
      }

      let summary = cleanUp.join(' ');

      imgDesc.forEach(val => {
        summary = summary.replace(`${val}`, '');
      });

      description = summary.replace(
        "Check if you need a permit before planning a waterfall trip. More information hereWaterfalls can be dangerous ! Always take care about your safety To add a comment you must logon/register firstrmb_ki101('79qfmgtj4fu','','26','26',1,'ffffff','010020','00fff6');",
        ''
      );

      const waterfall = {
        name: name,
        description: description,
        details: details,
        imgDetails: imgDetails,
        url: val
      };

      fs.writeFileSync(
        path.join(__dirname, 'data', 'waterfalls', `${waterfall.name}.json`),
        JSON.stringify(waterfall),
        'utf8'
      );
      console.log(`${waterfall.name}.json file saved`);
      // counter++;
      console.log(`Counter is currently: ${counter}`);

      // console.log(compile);
      // console.log($("td", data).find("img").attr("src"));

      // $("table", data).each(function () {
      // });
      // console.log(table);
    });
  } catch (err) {
    console.log(err);
    console.log(`Job error with ${url[counter]} ${name} Counter: ${counter}`);
    // counter++;
  }
});
// } else {
//   console.log(`Job completed!`);

//   return;
// }
// }, 1000 * 10);

// scraping data

// /*
// for (let i = 1; i < 14; i++) {
//   let content = [];
//   // let i = 10;
//   let website = `https://waterfallsofmalaysia.com/state.php?state_id=${i}`;

//   let state = stateArr[i - 1];

//   try {
//     axios(website)
//       .then((res) => {
//         const data = res.data;

//         // console.log(data);
//         const $ = cheerio.load(data);

//         $("tr", data).each(function (i, el) {
//           let textArr = [];
//           //   console.log(this);
//           //   const title = $(this).text();
//           const url = $(this).find("a").attr("href");
//           const text = $(this).find("font").text();
//           const img = $(this).find("img").attr("src");

//           if (!textArr.includes(text) && text !== undefined) {
//             textArr.push(text);
//           }

//           if (url) {
//             if (!content.includes(url)) {
//               content.push({
//                 url,
//                 textArr,
//                 img,
//               });
//             }
//           }

//           // app.get("/", (req, res) => {
//           //   res.json(content);
//           // });
//         });
//       })
//       .then(() => {
//         console.log(state);
//         const stateLowerCase = state.toLowerCase();

//         fs.writeFileSync(
//           path.join(`${filePath}`, `${stateLowerCase}.json`),
//           JSON.stringify(content),
//           {
//             encoding: "utf-8",
//           },
//           (err) => {
//             if (err) console.log(err);
//             else {
//               console.log("File written successfully\n");
//             }
//           }
//         );
//       })
//       .then(() => console.log(content));
//   } catch (err) {
//     console.log(err);
//   }
// }
// */
