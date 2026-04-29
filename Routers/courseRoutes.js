const express = require("express");
const router = express.Router();
const {joinCourse,createCourse,leaveCourse ,deleteCourse} = require("../controllers/courseController");
const authMiddleware = require("../midlwares/authMiddleware"); 

router.post("/join", authMiddleware, joinCourse);
router.post("/create", authMiddleware, createCourse);
router.delete("/leave/:courseId", authMiddleware, leaveCourse);
router.delete("/delete/:courseId", authMiddleware, deleteCourse);
module.exports = router;