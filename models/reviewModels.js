const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review is Must'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'ratings is Must'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'TourId is Must'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'UserId is Must'],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo'  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
