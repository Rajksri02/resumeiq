const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const { uploadResume } = require('../controllers/resumeController');

// Route uses auth protection and multer upload middleware
router.post('/upload', protect, uploadMiddleware, uploadResume);

module.exports = router;
