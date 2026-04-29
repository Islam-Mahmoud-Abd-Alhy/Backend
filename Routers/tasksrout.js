const express = require('express');
const router = express.Router();
const { addtask,deleteTask } = require('../controllers/taskacontroller');
const middleware = require('../midlwares/authMiddleware')

router.post('/add-tasks', middleware,addtask)
router.delete('/delete/:taskId',middleware,deleteTask)
module.exports = router;
