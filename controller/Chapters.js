const Chapter = require('../model/Chapters');
const mongoose = require('mongoose');
const {clearChaptersCache} = require('../middleware/cache');

// Handling async error
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

//Validating  ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


const getAllChapters = asyncHandler(async (req, res) => {
  const filters = {
    class: req.query.class,
    unit: req.query.unit,
    status: req.query.status,
    subject: req.query.subject,
    weakChapters: req.query.weakChapters === 'true',
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10
  };

  // Remove undefined values
  Object.keys(filters).forEach(key => {
    if (filters[key] === undefined || filters[key] === '') {
      delete filters[key];
    }
  });

  const result = await Chapter.getAllChapters(filters);
  
  res.status(200).json({
    success: true,
    data: result.chapters,
    pagination: result.pagination
  });
});



const createChapter = asyncHandler(async (req, res) => {
  let chaptersData = req.body;

  // If it's a single object, wrap it in an array
  if (!Array.isArray(chaptersData)) {
    chaptersData = [chaptersData];
  }

  // Validate each chapter object
  for (const chapter of chaptersData) {
    const { subject, chapter: chapterName, class: className, unit } = chapter;
    if (!subject || !chapterName || !className || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Subject, chapter, class, and unit are required fields in all chapters',
      });
    }
  }

  const preparedChapters = chaptersData.map((chapter) => {
    if (chapter.yearWiseQuestionCount && typeof chapter.yearWiseQuestionCount === 'object') {
      chapter.yearWiseQuestionCount = new Map(Object.entries(chapter.yearWiseQuestionCount));
    }
    chapter.questionSolved = chapter.questionSolved || 0;
    chapter.status = chapter.status || 'Not Started';
    chapter.isWeakChapter = chapter.isWeakChapter || false;
    return chapter;
  });

  const savedChapters = await Chapter.insertMany(preparedChapters);
  
  await clearChaptersCache(); 

  res.status(201).json({
    success: true,
    message: 'Chapter(s) created successfully',
    data: savedChapters,
  });
});


const getChapterById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid chapter ID format'
    });
  }

  const chapter = await Chapter.findById(id);

  if (!chapter) {
    return res.status(404).json({
      success: false,
      message: 'Chapter not found'
    });
  }

  res.status(200).json({
    success: true,
    data: chapter
  });
});

module.exports = {
  getAllChapters,
  createChapter,
  getChapterById
};