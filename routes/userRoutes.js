const express = require('express');
const authController = require('../handlers/authHandler');
const userController = require('../handlers/userHandler');

const userRouter = express.Router();

userRouter.post('/signup', authController.signUp);
userRouter.post('/login', authController.logIn);
userRouter.post('/forget', authController.forgetPassword);
userRouter.post('/reset/:token', authController.resetPassword);

userRouter.use(authController.protect);

userRouter.patch('/updateMe', userController.updateMe);
userRouter.delete('/deleteMe',  userController.deleteMe);
userRouter.patch('/updatepassword', authController.updatePass);

userRouter.use(authController.isPermitted(['admin']))
userRouter.route('/').get(userController.getAllUsers);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
