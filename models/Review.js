const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, `please add a title for review`],
    maxlenght: 100,
  },
  text: {
    type: String,

    required: [true, `please add a text for review`],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, `please add a ratin between 1 and 10 for review`],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});
//FIXME - make sure that user can make only one review

module.exports = mongoose.model('Review', ReviewSchema);
