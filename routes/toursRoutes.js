const express = require('express');
const fs = require('fs');
const {
  getAllTour,
  createTour,
  tourById,
  updateTour,
  deleteTour,
  aliasTopTours,
  tourDifficulty,
  tourmonthly,
} = require('../handlers/handlers');
const { protect, isPermitted } = require('../handlers/authHandler');
const reviewRouter = require('./reviewRoutes');

const tourRouter = express.Router();

tourRouter.use('/:tourId/review', reviewRouter);

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTour);
tourRouter.route('/tour-diff').get(tourDifficulty);
tourRouter
  .route('/tour-monthly/:year')
  .get(protect, isPermitted(['admin', 'lead-guide', 'guide']), tourmonthly);
tourRouter
  .route('/')
  .get(getAllTour)
  .post(protect, isPermitted(['admin', 'lead-guide']), createTour);
tourRouter
  .route('/:id')
  .get(tourById)
  .patch(protect, isPermitted(['admin', 'lead-guide']), updateTour)
  .delete(protect, isPermitted(['admin', 'lead-guide']), deleteTour);

module.exports = tourRouter;
