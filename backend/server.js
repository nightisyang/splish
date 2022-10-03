const config = require('./config');
const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// const app = express();

process.on('uncaughtException', err => {
  console.log('UNHANDLED EXCEPTION! Shutting down!');

  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');
// dotenv.config({ path: './config.env' });
console.log(process.env.NODE_ENV);
console.log(`NODE_ENV=${config.NODE_ENV}`);
console.log(config);

const DB = config.DATABASE.replace('<PASSWORD>', config.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  // eslint-disable-next-line no-console
  .then(() => console.log('DB connection successful!'));

const hostname = config.HOST;
const port = config.PORT;
const server = app.listen(port, hostname, () => {
  console.log(`App running at http://${hostname}:${port}/`);
});

process.on('unhandledRejection', err => {
  const fullMessage = err.message;
  const errmsgStart = 0; // Start at the beginnning
  const newline = /\n/; // new line character
  const errmsgStop = fullMessage.search(newline); // Find new line
  const errmsgLen = errmsgStop - errmsgStart;
  const errorText = fullMessage.substr(errmsgStart, errmsgLen);
  console.log(`💥Error Name💥: ${err.name}`);
  console.log(`💥💥Error Text: ${errorText}`);
  console.log('UNHANDLED REJECTION! Shutting down!');
  server.close(() => {
    process.exit(1);
  });
});
