const Review = require('../models/reviewModels');
const catchAsync = require('../utils/catchError');

const getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'Sucess',
    length: reviews.length,
    reviews: reviews,
  });
});

const createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  await Review.create(req.body);

  res.status(200).json({
    status: 'Sucess',
    reviews: 'Review Created',
  });
});

module.exports = { getAllReviews, createReview };
