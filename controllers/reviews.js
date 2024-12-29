const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

//  @desc        get all reviews
//  @route       Get /api/v1/:bootcampId/reviews
//  @access      public

exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    if (!reviews) {
      throw new ErrorResponse(`there is no reviews `, 404);
    }
    res.status(200).json({ success: true, data: reviews });
  } else {
    res.status(200).json({ success: true, data: res.advancedResults });
  }
});

//  @desc        get single review
//  @route       Get /api/v1/reviews/:id
//  @access      private

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new ErrorResponse(
      `there is no reviews with the Id of ${req.params.id} `,
      404
    );
  }
  res.status(200).json({ success: true, data: review });
});

//  @desc        create review
//  @route       POST /api/v1/bootcamp/:bootcampId/reviews
//  @access      private

exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  // came from token
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    throw new ErrorResponse(`No bootcamp with Id of ${req.params.id}`, 404);
  }
  const review = await Review.create(req.body);
  review.save();

  res.status(200).json({ success: true, data: review });
});

//  @desc        update review
//  @route       put /api/v1/reviews/:id
//  @access      private user

exports.updateReview = asyncHandler(async (req, res, next) => {
  // find review
  let review = await Review.findById(req.params.id);
  if (!review) {
    throw new ErrorResponse(`No review with id of ${req.params.id}`, 404);
  }
  // check if review user id === user
  if (review.user.toString() !== req.user.id) {
    throw new ErrorResponse(`Not authorized to access this route `, 401);
  }
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    RunValidators: true,
  });

  res.status(200).json({ success: true, updatedReview: review });
});

//  @desc        delete review
//  @route       delete /api/v1/reviews/:id
//  @access      private user

exports.deleteReview = asyncHandler(async (req, res, next) => {
  // find review
  let review = await Review.findById(req.params.id);
  if (!review) {
    throw new ErrorResponse(`No review with id of ${req.params.id}`, 404);
  }
  // check if review user id === user
  if (review.user.toString() !== req.user.id || req.user.role == 'admin') {
    throw new ErrorResponse(`Not authorized to access this route `, 401);
  }
  review = await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, deletedReview: review });
});
