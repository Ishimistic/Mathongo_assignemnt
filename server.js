const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const chapterRoutes = require('./router/Chapters');
const adminAuthRoutes = require('./router/AdminAuth');
const {connectRedis} = require('./config/redis');

const app = express();

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};


const initializeConnections = async () => {
    await connectDB();
    await connectRedis();
};

initializeConnections();


// API routes
app.use('/api/auth', adminAuthRoutes);
app.use('/api/chapters', chapterRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Chapter Tracker API',
    version: '1.0.0',
    endpoints: {
        auth: '/api/auth',
        chapters: '/api/chapters'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;