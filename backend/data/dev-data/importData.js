/* eslint-disable no-console */
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Waterfall = require('../../models/waterfallsModel');

dotenv.config({ path: '../../config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const waterfall = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'waterfalls.json'), 'utf-8')
);

console.log(waterfall[0]);

const importData = async () => {
  try {
    await Waterfall.create(waterfall);

    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Waterfall.deleteMany();

    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'))
  .then(() => {
    if (process.argv[2] === '--import') {
      importData();
    } else if (process.argv[2] === '--delete') {
      deleteData();
    }
  });
