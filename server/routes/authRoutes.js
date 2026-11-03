const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/authMiddleware');
const { register, login, getMe, deleteMe, forgotPassword, resetPassword } = require('../controllers/authController');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again after 15 minutes' }
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

router.post('/register', register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.delete('/me', protect, authLimiter, deleteMe);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
