const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'please add course title '],
  },
  description: {
    type: String,
    required: [true, 'please add course description'],
  },
  weeks: {
    type: String,
    required: [true, 'please add number of weeeks '],
  },
  tuition: {
    type: Number,
    required: [true, 'please add tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'please add a minimum skill of weeeks '],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: [true],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});
// //static method to get average of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {

  let obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: '$bootcamp', averageCost: { $avg: '$tuition' } } },
  ]);
  try {
    await this.model('Bootcamp').findByIdAndUpdate(
      bootcampId,
      Math.ceil(obj[0].averageCost / 10) * 10
    );
  } catch (err) {
    console.error(err);
  }
};

// call getAverageCost after save
CourseSchema.post('save', function () {

  this.constructor.getAverageCost(this.bootcamp);
});

// call getAverageCost before delete
CourseSchema.pre('findOneAndDelete', function (next) {
  console.log('Course about to be deleted, updating average tuition...');
  this.constructor.getAverageCost(this.bootcamp);
  next();
});

module.exports = mongoose.model('Course', CourseSchema);
