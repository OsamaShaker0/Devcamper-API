const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const JWT = require('jsonwebtoken');
const rand = require('random-key');
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please add a name '],
  },
  email: {
    type: String,
    required: [true, 'please add an email'],
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'please add avalid email',
    ],
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please add a password'],
    minlength: 6,
    maxlength: 30,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  // generate salt
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
//NOTE  - sing JWT and return

UserSchema.methods.getSignedJwtToken = function () {
  return JWT.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
//NOTE - match user entered password to hashed one in database
UserSchema.methods.matchPassword = async function (enterdPassword) {

  return await bcrypt.compare(enterdPassword, this.password);
};
// generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // generate key
  const resetToken = rand.generate(10);
  this.resetPasswordToken = resetToken;
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
