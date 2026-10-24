const fs = require('fs');
const { extractTextFromPDF } = require('../utils/pdfParser');
const { analyzeResumeText } = require('../utils/analyzeResume');
const { generateRewrites } = require('../utils/generateRewrites');
const Resume = require('../models/Resume');

// @desc    Upload resume, extract text, and analyze with Gemini
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded or invalid file format' });
  }

  const requestStartTime = Date.now();
  const filePath = req.file.path;
  const { jobDescription } = req.body;

  try {
    const extractedText = await extractTextFromPDF(filePath);

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({ 
        success: false,
        message: "This PDF appears to be a scanned image. Please upload a text-based PDF." 
      });
    }

    // Analyze with Gemini enforcing one overall deadline
    const TOTAL_TIMEOUT_MS = parseInt(process.env.GEMINI_TOTAL_TIMEOUT_MS || process.env.GEMINI_TIMEOUT_MS, 10) || 55000;
    const deadline = requestStartTime + TOTAL_TIMEOUT_MS;
    const analysisResult = await analyzeResumeText(extractedText, jobDescription, false, { deadline });

    // Save to database
    const resume = new Resume({
      user: req.user.id,
      fileName: req.file.originalname,
      extractedText,
      jobDescription,
      analysis: analysisResult
    });

    const savedResume = await resume.save();

    res.status(201).json(savedResume);
  } catch (error) {
    console.error('Error processing resume:', error);

    let statusCode = error.statusCode || error.status || 500;
    let message = error.message || 'Error processing the uploaded resume';

    const lower = (message + ' ' + (error.stack || '')).toLowerCase();
    if (
      statusCode === 504 ||
      lower.includes('504') ||
      lower.includes('timed out') ||
      lower.includes('timeout') ||
      error.code === 'GATEWAY_TIMEOUT' ||
      error.code === 'ETIMEDOUT'
    ) {
      statusCode = 504;
      message = error.statusCode === 504 ? error.message : 'The AI analysis timed out. The service took too long to respond, please try again.';
    } else if (
      lower.includes('429') ||
      lower.includes('quota') ||
      lower.includes('resource_exhausted') ||
      lower.includes('too many requests')
    ) {
      statusCode = 429;
      message = 'The AI service is busy, try again in a minute';
    } else if (
      lower.includes('503') ||
      lower.includes('service unavailable')
    ) {
      statusCode = 503;
      message = 'The AI service is busy, try again in a minute';
    } else if (
      lower.includes('api_key_invalid') ||
      lower.includes('api key not valid') ||
      lower.includes('invalid api key') ||
      lower.includes('permission_denied')
    ) {
      statusCode = 503;
      message = 'Analysis unavailable';
    } else if (
      lower.includes('generativelanguage.googleapis.com') ||
      lower.includes('google-generative-ai') ||
      lower.includes('googlegenerativeai')
    ) {
      statusCode = 500;
      message = 'Analysis unavailable';
    } else if (
      lower.includes('scanned_pdf_no_text') ||
      lower.includes('scanned image')
    ) {
      statusCode = 400;
      message = 'This PDF appears to be a scanned image. Please upload a text-based PDF.';
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV !== 'production' && error.stack ? { stack: error.stack } : {})
    });
  } finally {
    // Always clean up the temporary file, regardless of success or failure
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error('Error deleting temp file:', unlinkErr);
      }
    }
  }
};

// @desc    Get user's resume history
// @route   GET /api/resume/history
// @access  Private
const getResumeHistory = async (req, res) => {
  try {
    // Exclude extractedText to keep payload light
    const history = await Resume.find({ user: req.user.id })
      .select('-extractedText')
      .sort({ createdAt: -1 });
    
    res.status(200).json(history);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve history' });
  }
};

// @desc    Get single resume detail
// @route   GET /api/resume/:id
// @access  Private
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    
    res.status(200).json(resume);
  } catch (error) {
    console.error('Error getting resume by id:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to retrieve resume' });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resume/:id
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    
    await resume.deleteOne();
    res.status(200).json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to delete resume' });
  }
};

// Track in-flight rewrite generations to prevent duplicate concurrent runs
const activeGenerations = new Set();

// @desc    Generate or retrieve rewrite suggestions for a resume
// @route   POST /api/resume/:id/rewrites
// @access  Private
const getResumeRewrites = async (req, res) => {
  const requestStartTime = Date.now();
  const { id } = req.params;
  const shouldRegenerate = req.query.regenerate === 'true';

  try {
    const resume = req.resume || (await Resume.findOne({ _id: id, user: req.user.id }));

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // If rewrites already exist and regenerate is not requested, return them
    if (!shouldRegenerate && resume.rewritesGeneratedAt) {
      return res.status(200).json({
        success: true,
        rewrites: resume.rewrites || [],
        note: resume.rewritesNote || undefined,
        rewritesGeneratedAt: resume.rewritesGeneratedAt
      });
    }

    // In-flight guard: prevent duplicate concurrent generations for the same resume (e.g. double click)
    const resumeIdStr = resume._id.toString();
    if (activeGenerations.has(resumeIdStr)) {
      return res.status(409).json({
        success: false,
        message: 'Rewrite generation is already in progress for this resume. Please wait.'
      });
    }

    activeGenerations.add(resumeIdStr);

    try {
      // Enforce overall deadline
      const TOTAL_TIMEOUT_MS = parseInt(process.env.GEMINI_TOTAL_TIMEOUT_MS || process.env.GEMINI_TIMEOUT_MS, 10) || 55000;
      const deadline = requestStartTime + TOTAL_TIMEOUT_MS;

      const rewritesResult = await generateRewrites(
        {
          extractedText: resume.extractedText,
          weaknesses: resume.analysis?.weaknesses || [],
          suggestions: resume.analysis?.suggestions || [],
          jobDescription: resume.jobDescription
        },
        false,
        { deadline }
      );

      const rewrites = Array.isArray(rewritesResult) ? rewritesResult : (rewritesResult.rewrites || []);
      const note = rewritesResult.note || '';

      resume.rewrites = rewrites;
      resume.rewritesNote = note;
      resume.rewritesGeneratedAt = new Date();
      await resume.save();

      return res.status(200).json({
        success: true,
        rewrites: resume.rewrites,
        note: resume.rewritesNote || undefined,
        rewritesGeneratedAt: resume.rewritesGeneratedAt
      });
    } finally {
      activeGenerations.delete(resumeIdStr);
    }
  } catch (error) {
    console.error('Error generating rewrites:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    let statusCode = error.statusCode || error.status || 500;
    let message = error.message || 'Error generating rewrite suggestions';

    const lower = (message + ' ' + (error.stack || '')).toLowerCase();
    if (
      statusCode === 504 ||
      lower.includes('504') ||
      lower.includes('timed out') ||
      lower.includes('timeout') ||
      error.code === 'GATEWAY_TIMEOUT' ||
      error.code === 'ETIMEDOUT'
    ) {
      statusCode = 504;
      message = error.statusCode === 504 ? error.message : 'The AI analysis timed out. The service took too long to respond, please try again.';
    } else if (
      lower.includes('429') ||
      lower.includes('quota') ||
      lower.includes('resource_exhausted') ||
      lower.includes('too many requests')
    ) {
      statusCode = 429;
      message = 'The AI service is busy, try again in a minute';
    } else if (
      lower.includes('503') ||
      lower.includes('service unavailable')
    ) {
      statusCode = 503;
      message = 'The AI service is busy, try again in a minute';
    } else if (
      lower.includes('api_key_invalid') ||
      lower.includes('api key not valid') ||
      lower.includes('invalid api key') ||
      lower.includes('permission_denied')
    ) {
      statusCode = 503;
      message = 'Analysis unavailable';
    } else if (
      lower.includes('generativelanguage.googleapis.com') ||
      lower.includes('google-generative-ai') ||
      lower.includes('googlegenerativeai')
    ) {
      statusCode = 500;
      message = 'Analysis unavailable';
    } else if (statusCode === 422 || error.code === 'REWRITES_VALIDATION_FAILED') {
      statusCode = 422;
      message = error.message || 'Could not generate verifiable rewrite suggestions from your resume. Please try again.';
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV !== 'production' && error.stack ? { stack: error.stack } : {})
    });
  }
};

module.exports = {
  uploadResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
  getResumeRewrites
};
