const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgetPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout
} = require('../controllers/auth');
const { protect } = require('../middlewares/auth');
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(protect, getMe);
router.route('/logout').get(protect, logout);
router.route('/updatedetails').put(protect, updateDetails);
router.route('/updatepassword').put(protect, updatePassword);
router.route('/forgetPassword').post(forgetPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);
module.exports = router;
