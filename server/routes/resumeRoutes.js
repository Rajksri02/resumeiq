const express = require('express');
const router = express.Router();
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { protect } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
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
const rewritesLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.id || req.user?._id?.toString() || ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rewrite limit reached: maximum 5 requests per 10 minutes. Please try again later.'
  }
});

// Routes
router.post('/upload', protect, uploadLimiter, uploadMiddleware, uploadResume);
router.get('/history', protect, getResumeHistory);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);
router.post('/:id/rewrites', protect, rewritesLimiter, getResumeRewrites);

module.exports = router;
