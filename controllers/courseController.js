const Course = require("../models/Coursemodel");
const User = require("../models/UserModel");
const Student = require("../models/StudentModel");
const Teacher = require("../models/Teachermodel");

exports.joinCourse = async (req, res) => {
  try {
    const { accessCode } = req.body;
    const userId = req.user.id;

    const course = await Course.findOne({ accessCode: accessCode.toUpperCase() });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const user = await Student.findById(userId);
    if (!user) return res.status(403).json({ success: false, message: "Only students can join courses" });

    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ success: false, message: "You are already enrolled!" });
    }

    user.enrolledCourses.push(course._id);
    await user.save();

    course.students.push(userId);
    await course.save();

    const updatedUser = await Student.findById(userId).populate('enrolledCourses');
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, accessCode } = req.body;
    const teacherId = req.user.id;

    const existingCourse = await Course.findOne({ accessCode: accessCode.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({ success: false, message: "Access code already exists." });
    }

    const newCourse = await Course.create({ 
      title, 
      description, 
      accessCode: accessCode.toUpperCase(), 
      teacher: teacherId 
    });

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(403).json({ success: false, message: "Only teachers can create courses" });
    
    teacher.courses.push(newCourse._id); 
    await teacher.save();

    const updatedUser = await Teacher.findById(teacherId).populate('courses');

    res.status(201).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.leaveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id || req.user._id;

    await Student.findByIdAndUpdate(userId, {
      $pull: { enrolledCourses: courseId }
    });

    await Course.findByIdAndUpdate(courseId, {
      $pull: { students: userId }
    });

    const updatedUser = await Student.findById(userId).populate('enrolledCourses');

    res.status(200).json({
      success: true,
      message: "You have left the course",
      user: updatedUser
    });
  } catch (error) {
    console.error("Leave Course Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (course.teacher.toString() !== teacherId) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this course" });
    }

    await Student.updateMany(
      { enrolledCourses: courseId },
      { $pull: { enrolledCourses: courseId } }
    );

    await Teacher.findByIdAndUpdate(teacherId, {
      $pull: { courses: courseId }
    });

    await Course.findByIdAndDelete(courseId);

    const updatedUser = await Teacher.findById(teacherId).populate('courses');

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};