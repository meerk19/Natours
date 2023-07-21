const express = require('express');
const AppError = require('./utils/AppErrorHandler');
const globalErrorHandler = require('./handlers/errorHandler');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const morgan = require('morgan');
const tourRouter = require('./routes/toursRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const app = express();
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many req,try in one hour',
});
app.use('/api', limiter);
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/tours/:id', tourRouter);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/users/:id', userRouter);

app.use('/api/v1/review', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`This Route ${req.originalUrl} is not on server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
