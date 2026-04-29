const mongoose = require('mongoose');
const User = require('./UserModel');
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  accessCode: {
    type: String,
    required: true,
    unique: true 
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;