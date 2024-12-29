const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

// @desc            get all users
// @route           GET /api/v1/auth/users
// access           private/admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const user = await User.find({});
  res.status(200).json({ success: true, data: res.advancedResults });
});

// @desc            get single users
// @route           GET /api/v1/auth/users/:id
// access           private/admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.id });
  if (!user) {
    throw new ErrorResponse(`there is no user with id of ${req.params.id}`);
  }
  res.status(200).json({ success: true, data: user });
});

// @desc            create user
// @route           post /api/v1/auth/users
// access           private/admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
user.save()
  res.status(201).json({ success: true, data: {name:user.name , email:user.email , role:user.role}});
});

// @desc            update user
// @route           put /api/v1/auth/users/:id
// access           private/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select('-password');
  res.status(201).json({ success: true, updatedUser: user });
});

// @desc            delete user
// @route           delete /api/v1/auth/users/:id
// access           private/admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id).select('-password');
  res.status(201).json({ success: true, deletedUser: user });
});
