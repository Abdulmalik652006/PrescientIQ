const express = require('express');
const { register, login, getProfile, updateSettings, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, rules } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/register', rules.register, validate, register);
router.post('/login', rules.login, validate, login);
router.get('/me', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/settings', protect, updateSettings);

module.exports = router;
