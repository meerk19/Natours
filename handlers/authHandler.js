const { promisify } = require('util');
const crypto = require('crypto');
const User = require('../models/userModels');
const catchAsync = require('../utils/catchError');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppErrorHandler');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWS_TOKEN, {
    expiresIn: process.env.JWS_EXPIRES,
  });
};

const resToken = (obj, id, res) => {
  const token = signToken(id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWS_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(201).json({
    status: 'sucess',
    token,
    data: { obj },
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordCreatedAt: req.body.passwordCreatedAt,
    role: req.body.role,
    isActive: req.body.isActive,
  });

  resToken(user, user._id, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide Email or Password', 401));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Wrong Email/Password', 401));
  }
  resToken(null, user._id, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('Not Logged In, Please Signed In', 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWS_TOKEN);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError('User Not Exist now', 401));

  if (!currentUser.changePasswordAfter(decoded.iat))
    return next(new AppError('Please Logged InAgain,Pass change', 401));

  req.user = currentUser;
  next();
});

exports.isPermitted = (roles) => {
  return (req, res, next) => {
    console.log(roles);
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You are not Authorized', 403));
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(AppError('There is no Such User', 403));

  const resetToken = user.createPassToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Please reset your password ${resetUrl}`;
  console.log(resetUrl);
  try {
    await sendEmail({
      email: user.email,
      message: message,
      subject: 'Please reset your password',
    });
    res.status(200).json({
      status: 'sucess',
      message: 'token sent to email',
    });
  } catch (err) {
    user.passResetToken = undefined;
    user.tokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Failed to send', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passResetToken: resetToken,
    tokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Invalid or expired token', 400));
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passResetToken = undefined;
  user.tokenExpiresAt = undefined;
  await user.save();

  resToken(null, user._id, res);
});

exports.updatePass = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  const pass = await user.correctPassword(
    req.body.currentPassword,
    user.password
  );

  if (!pass) return next(new AppError('Current Pass is not Correct', 401));

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  resToken(null, user._id, res);
});
