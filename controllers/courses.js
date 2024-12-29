const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

// @desc     Get courses
// @Route    Get /api/v1/courses
// @Route    Get /api/v1/bootcamps/:bootcamPId/courses
// @access   Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      cuccess: true,
      count: courses.length,
      data: courses,
    });
  } else {
    return res.status(200).json(res.advancedResults);
  }
});
// @desc     get Single course
// @Route    get /api/v1/courses/:courseId
// @access   Public
exports.getSingleCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!course) {
    throw new ErrorResponse(
      `there is no course with this id ${req.params.id}`,
      404
    );
  }
  return res.status(200).json({
    success: true,
    data: course,
  });
});
// @desc     create courses
// @Route    post /api/v1/bootcamp/:bootcampId/courses
// @access   private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id of ${req.body.bootcamp}`, 404)
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role != 'admin') {
    throw new ErrorResponse(
      `User ${req.params.bootcampId} is not authorized to add  corse to this bootcamp ${bootcamp._id}`,
      401
    );
  }
  const course = await Course.create(req.body);
  return res.status(201).json({ success: true, data: course });
});
// @desc     update course
// @Route    put /api/v1/courses/:courseId
// @access   private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id}`),
      404
    );
  }
  if (course.user.toString() !== req.user.id && req.user.role != 'admin') {
    throw new ErrorResponse(
      `User ${req.params.id} is not authorized to update this course`,
      401
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  return res.status(200).json({ success: true, data: course });
});
// @desc     delete course
// @Route    delete /api/v1/courses/:courseId
// @access   private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findOne({ _id: req.params.id });
  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id} `),
      404
    );
  }
  if (course.user.toString() !== req.user.id && req.user.role != 'admin') {
    throw new ErrorResponse(
      `User ${req.params.id} is not authorized to delete this course`,
      401
    );
  }
  course = await Course.findByIdAndDelete(req.params.id);

  return res.status(200).json({ success: true, deletedCourse: course });
});
