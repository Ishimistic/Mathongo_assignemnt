const express = require('express');
const chapterController = require('../controller/Chapters');
const {authenticateToken} = require('../middleware/auth');
const {cacheMiddleware} = require('../middleware/cache');
const {rateLimiter} = require('../config/rateLimiter'); 

const router = express.Router();

//Applying rate limiting
router.use(rateLimiter); 

// Get all chapters with filters and pagination
router.get('/', cacheMiddleware(), chapterController.getAllChapters);

// Create a new chapter
router.post('/', authenticateToken, chapterController.createChapter);

// GET /api/chapters/:id - Get a single chapter by ID
router.get('/:id', cacheMiddleware(300), chapterController.getChapterById);

module.exports = router;