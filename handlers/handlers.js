const Tour = require('../models/tourModels');
const AppError = require('../utils/AppErrorHandler');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchError');
const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,summary';
  next();
};

const tourDifficulty = catchAsync(async (req, res, next) => {
  const tours = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        numTour: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);
  res.status(200).json({ status: 'sucess', data: { tours } });
});

const tourmonthly = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const tours = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    { $project: { _id: 0 } },
    { $sort: { month: 1 } },
  ]);
  res.status(200).json({ status: 'sucess', data: { tours } });
});

const getAllTour = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  res
    .status(200)
    .json({ status: 'sucess', results: tours.length, data: { tours } });
});

const tourById = catchAsync(async (req, res, next) => {
  const tours = await Tour.findById(req.params.id).populate('reviews')

  if (!tours) {
    return next(new AppError('No ID Found', 404));
  }
  res.status(200).json({ status: 'sucess', data: { tours } });
});

const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(200).json({ status: 'sucess', data: { tour: newTour } });
});

const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No ID Found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});
const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No ID Found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getAllTour,
  tourById,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  tourmonthly,
  tourDifficulty,
};
