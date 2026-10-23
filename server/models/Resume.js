/**
 * Why store extractedText instead of the raw PDF binary?
 * 
 * MongoDB has a document size limit of 16MB. While PDFs could be stored 
 * using GridFS, storing the raw extracted text directly in the document 
 * is far more efficient. This text is precisely what we need to feed into 
 * the LLM (Gemini) for analysis, and having the plain text readily available 
 * allows for easier re-analysis, full-text searching, or indexing in the future 
 * without needing to parse the PDF multiple times.
 */

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
  },
  extractedText: {
    type: String,
    // Note: Consider truncating extremely long text before saving if it exceeds reasonable token limits
  },
  jobDescription: {
    type: String,
  },
  analysis: {
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    overallSummary: String,
    strengths: [String],
    weaknesses: [String],
    missingSkills: [String],
    matchedSkills: [String],
    sectionFeedback: {
      summary: String,
      experience: String,
      education: String,
      skills: String,
      formatting: String,
    },
    suggestions: [String],
  },
  rewrites: [
    {
      section: { type: String, trim: true },
      original: { type: String, trim: true },
      improved: { type: String, trim: true },
      reason: { type: String, trim: true },
      needsInput: { type: Boolean, default: false },
    }
  ],
  rewritesGeneratedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
