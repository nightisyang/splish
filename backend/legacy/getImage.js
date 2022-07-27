const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.port || 3000;

app.listen(PORT, () => {
  console.log(`server is running on PORT:${PORT}`);
});

const waterfallJSONPath = path.join(__dirname, "data", "waterfalls");
const fullImagePath = path.join(__dirname, "data", "images");
const missing = [
  "Asahan Fall.json",
  "Ayer Puteh.json",
  "Jeram Tinggi.json",
  "Kota Tinggi.json",
  "Pulai Falls.json",
  "Puteri Fall.json",
  "Taka Melor.json",
];

async function downloadImage(url, filepath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on("error", reject)
      .once("close", () => {
        resolve(filepath);
        console.log(`${filepath} download completed!`);
      });
  });
}

// access url through individual json
const files = fs.readdirSync(waterfallJSONPath);
let i = 0;
let imgUrltemp = "";
let jsonObj;
let url;
let errorCollector = [];

const main = setInterval(() => {
  jsonObj = JSON.parse(
    fs.readFileSync(path.join(waterfallJSONPath, `${missing[i]}`))
  );
  url = jsonObj.url;
  if (!url) {
    errorCollector.push(jsonObj);
    i++;
    return;
  }

  mainFunction();
}, 5000);

async function mainFunction() {
  let fullResFilenameArr = [];

  try {
    await axios(`http://waterfallsofmalaysia.com/${url}`).then((res) => {
      const data = res.data;
      const $ = cheerio.load(data);

      // get a href that starts with http://waterfallsofmalaysia.com/php/image.php?database

      $("td", data).each(function () {
        imgUrltemp = $(this).find("a").attr("href");
        console.log(imgUrltemp);

        if (
          imgUrltemp !== undefined &&
          imgUrltemp.startsWith(
            "http://waterfallsofmalaysia.com/php/image.php?database"
          )
        ) {
          console.log(imgUrltemp);
          getFullRes(imgUrltemp);
        }
      });
    });
  } catch (err) {
    console.log(err);
    console.log(`Error requesting waterfall url`);
  }

  async function getFullRes(url) {
    try {
      // make request to site
      await axios(`${url}`).then((res2) => {
        const data2 = res2.data;
        const $ = cheerio.load(data2);

        // get img src url, save to imgDetails.imgFullResURL, imgDetails.imgFullResFilename

        $("td", data2).each(function () {
          let fullResURL = $(this).find("img").attr("src");
          const filename = fullResURL.split("/").pop();

          if (!fullResFilenameArr.includes(filename)) {
            fullResFilenameArr.push(filename);
            //   console.log(filename);

            // create download stream
            downloadImage(
              fullResURL,
              path.join(__dirname, "data", "images", filename)
            );
          }
        });
      });
    } catch (err) {
      console.log(`Error requesting full res image url`);
    }
  }

  const saveFiles = setInterval(() => {
    console.log(fullResFilenameArr);
    jsonObj.imgDetails.imgFullResFilename = fullResFilenameArr;

    fs.writeFileSync(
      path.join(waterfallJSONPath, `${missing[i]}`),
      JSON.stringify(jsonObj)
    );

    i++;
    console.log(`Current job count: ${i}`);

    clearTimeout(saveFiles);

    if (i === files.length - 1) {
      console.log(`ERROR: ${errorCollector}`);
      console.log("Job completed");
      clearInterval(main);
    }
  }, 1500);
}
