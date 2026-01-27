const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, hostel, block, roomNumber } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password, // Will be hashed automatically by pre-save hook
      phone,
      role: role || 'student',
      hostel,
      block,
      roomNumber
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostel: user.hostel,
        block: user.block,
        roomNumber: user.roomNumber
      },
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostel: user.hostel,
        block: user.block,
        roomNumber: user.roomNumber
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        hostel: req.user.hostel,
        block: req.user.block,
        roomNumber: req.user.roomNumber
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/auth/staff
// @desc    Get all staff members (for assignment dropdown)
// @access  Private - Management only
router.get('/staff', auth, async (req, res) => {
  try {
    if (req.user.role !== 'management') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const staff = await User.find({ role: 'staff' }).select('name email hostel block');
    res.json(staff);

  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;