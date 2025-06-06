const mongoose = require('mongoose');

// Define the schema for Chapter/Topic tracking
const chapterSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  chapter: {
    type: String,
    required: true,
    trim: true
  },
  
  class: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  unit: {
    type: String,
    required: true,
    trim: true
  },
  
  yearWiseQuestionCount: {
    type: Map,
    of: {
      type: Number,
      min: 0,
      default: 0
    },
    default: new Map()
  },
  
  questionSolved: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  status: {
    type: String,
    required: true,
    enum: ['Not Started', 'In Progress', 'Completed', 'Under Review'],
    default: 'Not Started'
  },
  
  isWeakChapter: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  versionKey: false
});

// Create indexes for better query performance
chapterSchema.index({ subject: 1, class: 1 });
chapterSchema.index({ status: 1 });
chapterSchema.index({ isWeakChapter: 1 });

// Virtual field to calculate total questions across all years
chapterSchema.virtual('totalQuestions').get(function() {
  if (!this.yearWiseQuestionCount) return 0;
  
  let total = 0;
  for (let count of this.yearWiseQuestionCount.values()) {
    total += count;
  }
  return total;
});

// Virtual field to calculate progress percentage
chapterSchema.virtual('progressPercentage').get(function() {
  const total = this.totalQuestions;
  if (total === 0) return 0;
  return Math.round((this.questionSolved / total) * 100);
});

// Instance method to add questions for a specific year
chapterSchema.methods.addQuestionsForYear = function(year, count) {
  if (!this.yearWiseQuestionCount) {
    this.yearWiseQuestionCount = new Map();
  }
  this.yearWiseQuestionCount.set(year.toString(), count);
  return this.save();
};

// Instance method to update solved questions and status
chapterSchema.methods.updateProgress = function(solvedCount) {
  this.questionSolved = solvedCount;
  
  const total = this.totalQuestions;
  if (total === 0) {
    this.status = 'Not Started';
  } else if (solvedCount === 0) {
    this.status = 'Not Started';
  } else if (solvedCount >= total) {
    this.status = 'Completed';
    this.questionSolved = total; // Ensure it doesn't exceed total
  } else {
    this.status = 'In Progress';
  }
  
  return this.save();
};

// Static method to get all chapters with filters and pagination
chapterSchema.statics.getAllChapters = async function(filters = {}) {
  const {
    class: className,
    unit,
    status,
    weakChapters,
    subject,
    page = 1,
    limit = 10
  } = filters;

  // Build the query object
  const query = {};
  
  if (className) query.class = className;
  if (unit) query.unit = unit;
  if (status) query.status = status;
  if (subject) query.subject = subject;
  if (typeof weakChapters === 'boolean') query.isWeakChapter = weakChapters;

  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get total count for pagination info
  const totalChapters = await this.countDocuments(query);
  
  // Get the chapters with pagination
  const chapters = await this.find(query)
    .sort({ createdAt: -1 }) // Sort by newest first
    .skip(skip)
    .limit(parseInt(limit))
    .lean(); // Use lean() for better performance when you don't need Mongoose document methods

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalChapters / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    chapters,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalChapters,
      hasNextPage,
      hasPrevPage,
      limit: parseInt(limit)
    }
  };
};

// Static method to find weak chapters
chapterSchema.statics.findWeakChapters = function(subject, className) {
  const query = { isWeakChapter: true };
  if (subject) query.subject = subject;
  if (className) query.class = className;
  
  return this.find(query);
};

// Static method to get progress summary by subject
chapterSchema.statics.getProgressSummary = function(subject, className) {
  const matchStage = {};
  if (subject) matchStage.subject = subject;
  if (className) matchStage.class = className;
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        chapters: { $push: '$chapter' }
      }
    }
  ]);
};

// Pre-save middleware to auto-update status based on progress
chapterSchema.pre('save', function(next) {
  if (this.isModified('questionSolved') || this.isModified('yearWiseQuestionCount')) {
    const total = this.totalQuestions;
    if (total > 0 && this.questionSolved >= total) {
      this.status = 'Completed';
      this.questionSolved = total;
    } else if (this.questionSolved > 0 && this.questionSolved < total) {
      this.status = 'In Progress';
    } else if (this.questionSolved === 0) {
      this.status = 'Not Started';
    }
  }
  next();
});

// Create and export the model
const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;