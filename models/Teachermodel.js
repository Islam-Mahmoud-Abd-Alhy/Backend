const mongoose = require('mongoose');
const User = require('./UserModel');

const teacherSchema = new mongoose.Schema({
  courses: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  }],

});

module.exports = mongoose.models.Teacher || User.discriminator('Teacher', teacherSchema);