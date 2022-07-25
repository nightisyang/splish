const express = require("express");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "data", "waterfalls");

const files = fs.readdirSync(filePath).map((fileName) => {
  jsonObj = JSON.parse(fs.readFileSync(path.join(filePath, fileName)));

  //   let imgFilename = [];
  //   jsonObj.img[0].imgUrl.forEach((url) => {
  //     // console.log(url);
  //     imgFilename.push(url.split("/").pop());
  //   });
  //   const { img } = jsonObj;
  //   console.log(img, typeof img);
  //   const { imgUrl, imgDesc } = img[0];

  //   jsonObj.imgDetails = {
  //     imgFilename: imgFilename,
  //     imgUrl: imgUrl,
  //     imgDesc: imgDesc,
  //   };

  //   img.imgFilename = imgFilename;
  //   img.imgUrl = imgUrl;
  //   img.imgDesc = imgDesc;

  //   if (!jsonObj.details) return;

  //   jsonObj.details.forEach((element) => {
  //     Object.assign(jsonObj, element);
  //   });

  delete jsonObj.img;

  fs.writeFileSync(path.join(filePath, fileName), JSON.stringify(jsonObj));
});
