const mongoose = require('mongoose');
const User = require('./UserModel');

const studentSchema = new mongoose.Schema({
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  progress: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    completedPercentage: { type: Number, default: 0 }
  }],
  teachers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }]
});

module.exports = mongoose.models.Student || User.discriminator('Student', studentSchema);