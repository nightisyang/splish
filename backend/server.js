const dotenv = require('dotenv');
const { initializeDatabase, closeDatabase } = require('./db/sqlite');

process.on('uncaughtException', err => {
  console.log('UNHANDLED EXCEPTION! Shutting down!');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// Initialize SQLite database
try {
  initializeDatabase();
  console.log('SQLite DB connection successful!');
} catch (err) {
  console.error('Failed to initialize SQLite database:', err.message);
  process.exit(1);
}

const hostname = '192.168.101.2';
const port = process.env.PORT || 8081;
const server = app.listen(port, hostname, () => {
  console.log(`App running at http://${hostname}:${port}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    closeDatabase();
    console.log('Process terminated!');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    closeDatabase();
    console.log('Process terminated!');
    process.exit(0);
  });
});

process.on('unhandledRejection', err => {
  const fullMessage = err.message || '';
  const errmsgStart = 0;
  const newline = /\n/;
  const errmsgStop = fullMessage.search(newline);
  const errmsgLen = errmsgStop > 0 ? errmsgStop - errmsgStart : fullMessage.length;
  const errorText = fullMessage.substr(errmsgStart, errmsgLen);
  console.log(`Error Name: ${err.name}`);
  console.log(`Error Text: ${errorText}`);
  console.log('UNHANDLED REJECTION! Shutting down!');
  server.close(() => {
    closeDatabase();
    process.exit(1);
  });
});
