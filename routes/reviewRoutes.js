const express = require('express');
const { getAllReviews, createReview } = require('../handlers/reviewHandler');
const { protect, isPermitted } = require('../handlers/authHandler');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(protect);

reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(isPermitted(['user']), createReview);

module.exports = reviewRouter;
