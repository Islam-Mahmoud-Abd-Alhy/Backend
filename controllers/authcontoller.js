const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const toClientUser = (userDoc) => ({
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: String(userDoc.role || '').toLowerCase(),
    tasks: userDoc.tasks || [],
    phone: userDoc.phone || '',
    bio: userDoc.bio || '',
    location: userDoc.location || '',
    preferences: userDoc.preferences || {},
    plan: userDoc.plan,
    isTrialUsed: userDoc.isTrialUsed,
    trialEndDate: userDoc.trialEndDate,
});

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();
const sanitizeString = (value = '', max = 120) => String(value).trim().slice(0, max);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid input types' });
        }
        const user = await User.findOne({ email: normalizeEmail(email) }).populate('tasks');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: true, 
            sameSite: 'none', 
            maxAge: 24 * 60 * 60 * 1000 
        });

        res.status(200).json({ 
            success: true,
            message: 'Login successful',
            user: toClientUser(user),
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const safeName = sanitizeString(name, 60);
        const safeEmail = normalizeEmail(email);
        const safeRole = String(role || '').toLowerCase();

        if (!safeName || !isValidEmail(safeEmail) || String(password || '').length < 8) {
            return res.status(400).json({ message: 'Invalid signup data' });
        }

        const existingUser = await User.findOne({ email: safeEmail });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        let newUser;
        if (safeRole === 'student') {
            const Student = require('../models/StudentModel');
            newUser = await Student.create({ name: safeName, email: safeEmail, password: hashedPassword });
        } else if (safeRole === 'teacher') {
            const Teacher = require('../models/Teachermodel');
            newUser = await Teacher.create({ name: safeName, email: safeEmail, password: hashedPassword });
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        res.status(201).json({ 
            success: true, 
            message: `${role} created successfully`,
            user: toClientUser(newUser), 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.freeTrial = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "user not found" });
        if (user.isTrialUsed) return res.status(400).json({ message: "Used before" });

        user.plan = "trial";
        user.trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        user.isTrialUsed = true;
        await user.save();

        res.status(200).json({ success: true, user: { plan: user.plan, isTrialUsed: user.isTrialUsed } });
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
};

exports.updateAccount = async (req, res) => {
    try {
        const { name, email, phone, bio, location, preferences } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "user not found" });

        const nextName = name ? sanitizeString(name, 60) : user.name;
        const nextEmail = email ? normalizeEmail(email) : user.email;
        if (!nextName || !isValidEmail(nextEmail)) {
            return res.status(400).json({ success: false, message: 'Invalid account data' });
        }

        if (nextEmail !== user.email) {
            const exists = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
            if (exists) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
        }

        user.name = nextName;
        user.email = nextEmail;
        user.phone = phone !== undefined ? sanitizeString(phone, 30) : user.phone;
        user.bio = bio !== undefined ? sanitizeString(bio, 280) : user.bio;
        user.location = location !== undefined ? sanitizeString(location, 120) : user.location;
        if (preferences && typeof preferences === 'object') {
            user.preferences = {
                ...user.preferences,
                ...preferences,
            };
        }
        await user.save();
        res.status(200).json({ 
            success: true, 
            user: toClientUser(user),
        });
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid password payload' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const matches = await bcrypt.compare(currentPassword, user.password);
        if (!matches) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updtaeProfile = exports.updateAccount;