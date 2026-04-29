const mongoose = require('mongoose');

const baseoptions = {
    discriminatorKey: 'role',
    collection: 'users',
    timestamps: true
}
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Teacher'] },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  phone: { type: String, trim: true, default: '' },
  bio: { type: String, trim: true, default: '', maxlength: 280 },
  location: { type: String, trim: true, default: '', maxlength: 120 },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: true },
    profilePublic: { type: Boolean, default: false },
  },
}, baseoptions);

module.exports = mongoose.model('User', userSchema);