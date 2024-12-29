const { protect, authorize } = require('../middlewares/auth');
const User = require('../models/User')
const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');
const advancedResults = require('../middlewares/advanceResults');
router.use(protect);
router.use(authorize('admin'));
router.route('/').get(advancedResults(User), getUsers).post(createUser);
router.route('/:id').put(updateUser).delete(deleteUser).get(getUser);

module.exports = router;
