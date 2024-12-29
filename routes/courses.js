const express = require('express');
const Course = require('../models/Course');
const advancedResults = require('../middlewares/advanceResults');
const router = express.Router({ mergeParams: true });
const {
  getCourses,
  getSingleCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');
const {protect , authorize} = require('../middlewares/auth');
router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name',
    }),
    getCourses
  )
  .post(protect, authorize('publisher' , 'admin'),addCourse);
router
  .route('/:id')
  .get(getSingleCourse)
  .put(protect, authorize('publisher' , 'admin'),updateCourse)
  .delete(protect, authorize('publisher' , 'admin'),deleteCourse);
module.exports = router;
