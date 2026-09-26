const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const { 
  uploadResume,
  getResumeHistory,
  getResumeById,
  deleteResume 
} = require('../controllers/resumeController');

// Route uses auth protection and multer upload middleware
router.post('/upload', protect, uploadMiddleware, uploadResume);
router.get('/history', protect, getResumeHistory);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);

module.exports = router;
