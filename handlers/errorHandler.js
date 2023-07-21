const AppError = require('../utils/AppErrorHandler');

const sendErrorProd = (err, res) => {
  if (err.isOperational === true) {
    res.status(err.statusCode).json({
      status: err.status || 'error',
      message: err.message,
    });
  } else {
    console.log('Err Occurs');
    res.status(500).json({
      status: 'fail',
      message: 'Something Went Wrong',
    });
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.stats || 'error';

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err.name === 'CastError') {
      const message = `${error.value} doesnt Exist`;

      error = new AppError(message, 404);
    }
    if (err.code === 11000) {
      const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

      const message = `Duplicate field value: ${value}. Please use another value!`;
      error =  new AppError(message, 400);
    }
    if (err.name === 'ValidationError') {
      error = new AppError(err.message, 400);
    }
    if(err.name ='JsonWebTokenError'){
      error=new AppError('Invalid Token, Please Logged In Again',401)
    }
    if(err.name='TokenExpiredError'){
      error=new AppError('Token Expired,loged again',401)
    }
    sendErrorProd(error, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
};

module.exports = globalErrorHandler;
