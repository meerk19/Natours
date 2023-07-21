const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Name is must'],
  },
  email: {
    type: String,
    require: [true, 'Email is must'],
    validate: [validator.isEmail, 'Please provide valid email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    minLength: 8,
    required: [true, 'Please provide a Password'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please provide a Password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords are not same',
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordCreatedAt: Date,
  passResetToken: String,
  tokenExpiresAt: Date,
  isActive: { type: Boolean, default: true, select: false },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordCreatedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async function (
  candiatePassword,
  userPassword
) {
  return await bcrypt.compare(candiatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (createdAt) {
  return this.passwordCreatedAt.getTime() / 1000 < createdAt;
};

userSchema.methods.createPassToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.tokenExpiresAt = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
