const AppError = require('../utils/AppErrorHandler');
const User = require('../models/userModels');
const catchAsync = require('../utils/catchError');

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { isActive: false });
  res.status(204).json({
    status: 'sucess',
    data: null,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(
      new AppError('Please choose correct route for password change', 401)
    );

  const updated = { email: req.body.email, name: req.body.name };

  Object.keys(updated).forEach((key) => {
    if (updated[key] === undefined) {
      delete updated[key];
    }
  });
  const updatedUser = await User.findByIdAndUpdate(req.user._id, updated, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'sucess',
    data: updatedUser,
  });
});
exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    message: { users },
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
