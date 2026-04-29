const Tasks = require('../models/TaskModel'); 
const User = require('../models/UserModel')
exports.addtask = async (req, res) => {
    try {
        const { title, description, status, importance } = req.body;

        const newTask = new Tasks({
            title,
            description: description || "",
            status: status || "pending",
            importance: importance || "easy",
            user: req.user.id
        });

        const savedTask = await newTask.save();

        await User.findByIdAndUpdate(req.user.id, { $push: { tasks: savedTask._id } });

        res.status(201).json({
            success: true,
            task: savedTask 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Tasks.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }
        if (String(task.user) !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: "Forbidden: task does not belong to current user" });
        }

        await Tasks.findByIdAndDelete(taskId);
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { tasks: taskId } },
            { new: true }
        ).populate('tasks');

        res.status(200).json({ success: true, message: "Task deleted", user: updatedUser,tasks: updatedUser.tasks});
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};