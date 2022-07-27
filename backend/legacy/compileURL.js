const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const filePath = path.join(__dirname, "data", "state");
// const stateArr = [
//   "Johor",
//   "Kedah",
//   "Kelantan",
//   "Malacca",
//   "Negri Sembilan",
//   "Pahang",
//   "Perak",
//   "Perlis",
//   "Penang",
//   "Sabah",
//   "Sarawak",
//   "Selangor",
//   "Terengganu",
// ];

// const stateLowerCase = state.toLowerCase();

let compiledURL = [];
const isFile = (fileName) => {
  return fs.lstatSync(fileName).isFile();
};

let files = fs.readdirSync(filePath).map((fileName) => {
  if (fileName === ".DS_Store") {
    return;
  } else {
    return path.join(filePath, fileName);
  }
});

files.splice(0, 2);

files.forEach((filePath) => {
  const file = fs.readFileSync(filePath, "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  JSON.parse(file).forEach((el) => {
    const { url } = el;
    // console.log(url);
    compiledURL.push(url);
  });
});

const uniqueURL = [...new Set(compiledURL)];

console.log(uniqueURL);

fs.writeFileSync(
  path.join(__dirname, "data", "compiledURL.json"),
  JSON.stringify(uniqueURL),
  "utf8"
);
