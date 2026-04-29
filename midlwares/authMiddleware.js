const JWT = require('jsonwebtoken');
const User = require('../models/UserModel');

const authMiddleware = async (req, res, next) => {
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = JWT.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.id).select('-password').populate('tasks');
        if(!user){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user; 
        next();
    }catch(error){
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
module.exports = authMiddleware;