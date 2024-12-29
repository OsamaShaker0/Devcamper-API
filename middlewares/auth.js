const User = require('../models/User');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  // if (
  //   !req.headers.authorization ||
  //   !req.headers.authorization.startsWith('Bearer ')
  // ) {
  //   next(new ErrorResponse(`Not authrized to access this route `, 401));
  // }
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  // make sure that token is exist
  if (!token) {
    next(new ErrorResponse(`Not authrized to access this route `, 401));
  }
  try {
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // send user
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    throw new ErrorResponse(`Not authrized to access this route `, 401);
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ErrorResponse(
        `User role ${req.user.role} is not authorized to eccess this route`,
        403
      );
    }

    next();
  };
};
