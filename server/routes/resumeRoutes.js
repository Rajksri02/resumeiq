const express = require('express');
const router = express.Router();
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { protect } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const Resume = require('../models/Resume');
const { 
  uploadResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
  getResumeRewrites
} = require('../controllers/resumeController');

// Rate limiting: 5 uploads per 10 minutes per authenticated user (falling back to IP)
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.id || req.user?._id?.toString() || ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload limit reached: maximum 5 uploads per 10 minutes. Please try again later.'
  }
});

// Rate limiting: 5 rewrite requests per 10 minutes per authenticated user (falling back to IP)
// Applied only when a generation actually occurs (cached reads bypass this)
const rewritesLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  skipFailedRequests: true,
  keyGenerator: (req) => req.user?.id || req.user?._id?.toString() || ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rewrite limit reached: maximum 5 requests per 10 minutes. Please try again later.'
  }
});

// Middleware to serve cached rewrites before rate limiter is engaged
const checkRewriteCache = async (req, res, next) => {
  const shouldRegenerate = req.query.regenerate === 'true';
  if (!shouldRegenerate) {
    try {
      const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
      if (!resume) {
        return res.status(404).json({ success: false, message: 'Resume not found' });
      }
      if (resume.rewritesGeneratedAt) {
        return res.status(200).json({
          success: true,
          rewrites: resume.rewrites || [],
          metricPrompts: resume.metricPrompts || [],
          note: resume.rewritesNote || undefined,
          rewritesGeneratedAt: resume.rewritesGeneratedAt
        });
      }
      // Pass the retrieved resume to avoid double query in controller
      req.resume = resume;
    } catch (err) {
      if (err.name === 'CastError') {
        return res.status(404).json({ success: false, message: 'Resume not found' });
      }
      return res.status(500).json({ success: false, message: 'Failed to retrieve resume' });
    }
  }
  next();
};

// Routes
router.post('/upload', protect, uploadLimiter, uploadMiddleware, uploadResume);
router.get('/history', protect, getResumeHistory);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);
router.post('/:id/rewrites', protect, checkRewriteCache, rewritesLimiter, getResumeRewrites);

module.exports = router;
