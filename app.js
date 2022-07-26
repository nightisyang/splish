// const path = require('path');
const express = require('express');
const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const waterfallRouter = require('./routes/waterfallRoutes');

dotenv.config({ path: './config.env' });

const app = express();

// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// serving static files
// app.use(express.static(path.join(__dirname, 'public')));

// SET SECURITY HTTP HEADERS
// const scriptSrcUrls = [
//   'https://unpkg.com/',
//   'https://tile.openstreetmap.org',
//   'https://js.stripe.com',
//   'https://m.stripe.network',
//   'https://*.cloudflare.com'
// ];
// const styleSrcUrls = [
//   'https://unpkg.com/',
//   'https://tile.openstreetmap.org',
//   'https://fonts.googleapis.com/'
// ];
// const connectSrcUrls = [
//   'https://unpkg.com',
//   'https://tile.openstreetmap.org',
//   'https://*.stripe.com',
//   'https://bundle.js:*',
//   'ws://127.0.0.1:*/'
// ];
// const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", ...fontSrcUrls],
//       scriptSrc: ["'self'", 'https:', 'http:', 'blob:', ...scriptSrcUrls],
//       frameSrc: ["'self'", 'https://js.stripe.com'],
//       objectSrc: ["'none'"],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", 'blob:', 'https://m.stripe.network'],
//       childSrc: ["'self'", 'blob:'],
//       imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
//       formAction: ["'self'"],
//       connectSrc: [
//         "'self'",
//         "'unsafe-inline'",
//         'data:',
//         'blob:',
//         ...connectSrcUrls
//       ],
//       upgradeInsecureRequests: []
//     }
//   })
// );

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate-limiter to prevent DDoS attacks
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!'
// });
// app.use('/api', limiter);

// body parser, reading data from body into req.body, limits size to prevent malicious payload
app.use(express.json({ limit: '10kb' }));

// parses data from html form submit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// parse data from cookie
app.use(cookieParser());

// data sanitization against NoSQL query injection
// removes operators ($) from body
app.use(mongoSanitize());

// data sanitization against XSS (cross site service) attacks
app.use(xss());

// prevent parameter pollution - clears up query string
// app.use(
//   hpp({
//     whitelist: [
//       'duration',
//       'ratingsQuantity',
//       'average',
//       'maxGroupSize',
//       'difficulty',
//       'price'
//     ]
//   })
// );

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/api/v1/waterfalls', waterfallRouter);
// app.use('/', viewRouter);
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// if use has 4 parameters, express recognises it as error handling middleware
// global handling middleware
app.use(globalErrorHandler);

module.exports = app;
