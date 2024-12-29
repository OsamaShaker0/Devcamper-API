const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Course = require('../models/Course');

// @desc     Get all bootcamps
// @Route    Get /api/v1/bootcamps
// @access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  return res.status(200).json(res.advancedResults);
});

// @desc     Get single bootcamp
// @Route    Get /api/v1/bootcamps/:id
// @access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404)
    );
  }

  return res
    .status(200)
    .json({ success: true, bootcamdID: req.params.id, bootcamp });
});

// @desc     craete new bootcamp
// @Route    post /api/v1/bootcamps/
// @access   private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // add user to req.body
  req.body.user = req.user.id;
  // check for published bootcamps
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
  // check if user are publisher or admin , publisher can create one course
  if (publishedBootcamp && req.user.role !== 'admin') {
    throw new ErrorResponse(
      `the user with id ${req.user.id} has already published a bootcamp`,
      400
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  return res.status(201).json({ success: true, data: bootcamp });
});

// @desc     update  bootcamp
// @Route    put /api/v1/bootcamps/:id
// @access   private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404)
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ErrorResponse(
      `User ${req.params.id} is not authorized to update this bootcamp`,
      401
    );
  }
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  return res.status(200).json({ success: true, data: bootcamp });
});

// @desc     delete  bootcamp
// @Route    Delete /api/v1/bootcamps/:id
// @access   private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with ID of ${req.params.id}`, 404)
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ErrorResponse(
      `User ${req.params.id} is not authorized to delete this bootcamp`,
      401
    );
  }
  bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  // remove courses with this bootcamp
  await Course.deleteMany({ bootcamp: req.params.id });
  res.status(200).json({
    success: true,
    msg: `delete bootcamp with ID ${req.params.id}`,
    deletedData: bootcamp,
  });
});
// @desc     upload photo for  bootcamps
// @Route    put /api/v1/bootcamps/:id/photo
// @access   private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp not found with id of ${req.params.id}`),
      404
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ErrorResponse(
      `User ${req.params.id} is not authorized to update this bootcamp`,
      401
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`please upload a file`), 400);
  }

  const file = req.files.file;
  // make sure that file is photo
  if (!file.mimetype.startsWith('image')) {
    throw new ErrorResponse(`please upload an image file`, 400);
  }
  // check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    throw new ErrorResponse(
      `please upload an image less than ${process.env.MAX_FILE_UPLOAD} byte`,
      400
    );
  }
  // craete custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  // upload photo
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      throw new ErrorResponse(`Problem with file uplaod =>${err}`, 500);
    }
    await Bootcamp.findByIdAndUpdate(
      req.params.id,
      { photo: file.name },
      { new: true }
    );
    return res.status(200).json({ sucess: true, data: file.name });
  });
});
