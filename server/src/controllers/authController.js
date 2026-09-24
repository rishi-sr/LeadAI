const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const Log = require('../models/Log');

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, { expiresIn: '7d' });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      await Log.create({
        level: 'WARN',
        category: 'AUTH',
        message: `Failed login attempt for: ${email}`,
        ip: req.ip
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    await Log.create({
      level: 'INFO',
      category: 'AUTH',
      message: `User logged in: ${user.email} (${user.role})`,
      userId: user._id,
      ip: req.ip
    });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

module.exports = {
  login,
  getMe
};
