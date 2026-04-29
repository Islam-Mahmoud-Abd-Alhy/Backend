const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const tasksrouter = require('./Routers/tasksrout')
dotenv.config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('./models/TaskModel');
const port = process.env.PORT ;
const connectDB = process.env.MONGO_URL;
const courseRouter = require('./Routers/courseRoutes');

app.use(cors({ 
  origin: true, 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

const authRouter = require('./Routers/authRout'); 
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksrouter);


app.use('/api/courses', courseRouter);

mongoose.connect(connectDB)
.then(()=> console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})

