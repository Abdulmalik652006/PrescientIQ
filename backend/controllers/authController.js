const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password, role, department });
    const token = signToken(user._id);

    res.status(201).json({ success: true, token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user._id);
    res.json({ success: true, token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
const getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, department, password, settings } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (department) user.department = department;
    if (password) user.password = password;

    if (settings && typeof settings === 'object') {
      user.settings = { ...user.settings, ...settings };
    }

    await user.save();
    res.json({ success: true, message: 'Profile updated successfully', user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/auth/settings
const updateSettings = async (req, res, next) => {
  try {
    const allowedKeys = [
      'theme',
      'riskThreshold',
      'predictionConfidenceThreshold',
      'alertFrequency',
      'defaultForecastPeriod',
      'notificationsEnabled',
    ];
    const updates = {};
    allowedKeys.forEach((key) => {
      if (req.body[key] !== undefined) updates[`settings.${key}`] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateSettings, updateProfile };
