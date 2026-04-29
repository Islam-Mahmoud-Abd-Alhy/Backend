const express = require("express");
const router = express.Router();
const auth = require("../controllers/authcontoller");
const authMiddleware = require("../midlwares/authMiddleware");
const User = require("../models/UserModel");
const Teacher = require("../models/Teachermodel");
const Student = require("../models/StudentModel");

router.post("/login", auth.login);
router.post("/signup", auth.signup);
router.post("/logout", auth.logout);
router.put("/update-profile", authMiddleware, auth.updateAccount);
router.put("/account", authMiddleware, auth.updateAccount);
router.put("/change-password", authMiddleware, auth.changePassword);
router.post("/free-trial", authMiddleware, auth.freeTrial);
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const baseUser = await User.findById(userId);
    if (!baseUser) return res.status(404).json({ success: false, message: "User not found" });

    let userData;
    if (baseUser.role === 'Teacher') {
      userData = await Teacher.findById(userId).populate('courses').populate('tasks');
    } else if (baseUser.role === 'Student') {
      userData = await Student.findById(userId).populate('enrolledCourses').populate('tasks');
    } else {
      userData = baseUser;
    }

    const safeUser = {
      id: userData._id,
      name: userData.name,
      email: userData.email,
      role: String(userData.role || '').toLowerCase(),
      tasks: userData.tasks || [],
      courses: userData.courses || [],
      enrolledCourses: userData.enrolledCourses || [],
      phone: userData.phone || '',
      bio: userData.bio || '',
      location: userData.location || '',
      preferences: userData.preferences || {},
      plan: userData.plan,
      isTrialUsed: userData.isTrialUsed,
      trialEndDate: userData.trialEndDate,
    };

    res.status(200).json({
      success: true,
      user: safeUser
    });

  } catch (error) {
    console.error("Auth Me Error:", error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
