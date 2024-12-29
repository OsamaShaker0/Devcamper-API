const express = require('express');
const advancedResults = require('../middlewares/advanceResults');
const Bootcamp = require('../models/Bootcamp');
const router = express.Router();
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');
const {protect ,authorize} = require('../middlewares/auth');

// include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');
// re-route into other resource router
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews',reviewRouter)

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect,authorize('publisher' , 'admin'),createBootcamp);
router.route('/:id/photo').put( protect,bootcampPhotoUpload);
router
  .route('/:id')
  .get(getBootcamp)
  .put(protect,authorize('publisher' , 'admin'),updateBootcamp)
  .delete(protect,authorize('publisher' , 'admin'),deleteBootcamp);

module.exports = router;
