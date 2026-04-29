const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'completed'], 
        default: 'pending' 
    },
    importance: {
        type: String, 
        enum: ['hard', 'medium', 'easy'], 
        default: 'easy'
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);