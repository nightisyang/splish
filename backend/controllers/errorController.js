const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'"])(\\?.)*?\1/);
  // console.log(value);

  const message = `Duplicate field value: ${value[0]}. Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(ele => ele.message);

  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again', 401);

const sendErrorDev = function(err, req, res) {
  // if req is coming from API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  // if req is coming from rendered website, return error site
  // eslint-disable-next-line no-console
  console.error('💥ERROR💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong :(',
    msg: err.message
  });
};

const sendErrorProd = function(err, req, res) {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // Programming or other unknown error
    // 1) Log error
    // eslint-disable-next-line no-console
    console.error('💥ERROR💥', err);

    // 2) send generic error

    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // RENDERED SITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong :(',
      msg: err.message
    });

    // Programming or other unknown error
  }
  // 1) Log error
  // eslint-disable-next-line no-console
  console.error('💥ERROR💥', err);

  // 2) send generic error

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong :(',
    msg: 'Please try again later!'
  });
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    sendErrorProd(error, req, res);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
  }
};
