const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.join(__dirname, `${process.env.NODE_ENV}.env`)
});

console.log(`${process.env.NODE_ENV}`);

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  DATABASE: process.env.DATABASE,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD
};
