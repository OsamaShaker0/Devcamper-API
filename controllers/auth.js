const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const crypto = require('crypto');

// @Desc    register user
// @Route   post  /api/v1/auth/register
// @eccess   public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  //NOTE - create token
  sendTokenResponse(user, res, 200);
});

// @Desc    login user
// @Route   post  /api/v1/auth/login
// @eccess   public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // validate email and password
  if (!email || !password) {
    throw new ErrorResponse(`please provide an email and a password`, 400);
  }
  // check for user
  const user = await User.findOne({ email });
  if (!user) {
    throw new ErrorResponse(`invalid credentials`, 401);
  }
  // check if password matches
  const Ismatch = await user.matchPassword(password);

  if (!Ismatch) {
    throw new ErrorResponse(`invalid credentials`, 401);
  }
  sendTokenResponse(user, res, 200);
});

// @Desc    logout current login user /clear cookie
// @Route   Get  /api/v1/auth/logout
// @eccess   private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: 'user Logout' });
});
// @Desc    get current login user
// @Route   post  /api/v1/auth/me
// @eccess   private
exports.getMe = asyncHandler(async (req, res, next) => {
  // we can access user from the protect middleware
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json({ success: true, data: user });
});
// @Desc    get current login user
// @Route   post  /api/v1/auth/me
// @eccess   private
exports.getMe = asyncHandler(async (req, res, next) => {
  // we can access user from the protect middleware
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json({ success: true, data: user });
});
// @Desc    update password
// @Route   put  /api/v1/auth/updatepassword
// @eccess   private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { newPassword, currentPassword } = req.body;
  if (!newPassword || !currentPassword) {
    throw new ErrorResponse('Bad Requset ', 400);
  }
  // we can access user from the protect middleware
  const user = await User.findById(req.user.id);
  //check password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    throw new ErrorResponse('password is incoorect', 401);
  }
  user.password = req.body.newPassword;
  await user.save();
  sendTokenResponse(user, res, 200);
});
// @Desc    update user details
// @Route   put  /api/v1/auth/updatedetails
// @eccess   private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  // we can access user from the protect middleware
  const filedsToUpdate = {
    name: req.body.name,
    email: req.user.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, filedsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});
// @Desc    forget password
// @Route   post  /api/v1/auth/forgetPassword
// @eccess   public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const email = req.body.email;
  if (!email) {
    throw new ErrorResponse(`please enter your email`, 400);
  }
  let user = await User.findOne({ email }).select('-password');
  if (!user) {
    throw new ErrorResponse(`there is no user with this email`, 404);
  }
  // get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  // create reset URL
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetPassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has
  requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  let options = {
    from: process.env.EMAIL_SENDER,
    to: user.email,
    subject: `password reset token`,
    text: message,
  };

  try {
    await sendEmail(options);
    return res
      .status(200)
      .json({ success: true, data: 'Email sent', url: resetUrl });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ErrorResponse(`email could not be sent`, 500);
  }
});

// @Desc    reset password
// @Route   put  /api/v1/auth/resetpassword/:resettoken
// @eccess   public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetToken = req.body.resetToken;
  const email = req.body.email;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ErrorResponse('invalid token', 400);
  }
  if (user.resetPasswordToken == undefined) {
    throw new ErrorResponse('invalid token', 400);
  }
  // set new password
  if (user.resetPasswordToken == resetToken) user.password = '';
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  await user.save();
  sendTokenResponse(user, res, 200);
});

//NOTE -  send token cookie response
const sendTokenResponse = function (user, res, statusCode) {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
  };
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};
