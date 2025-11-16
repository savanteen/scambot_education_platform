// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, gameName } = req.body;
    
    // Validate input
    if (!email || !gameName) {
      return res.status(400).json({ 
        message: 'Email and game name are required' 
      });
    }
    
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      // User exists, return their info
      return res.status(200).json({ 
        message: 'Welcome back!',
        userId: user._id,
        email: user.email,
        gameName: user.gameName
      });
    }
    
    // Create new user
    user = new User({
      email: email.toLowerCase(),
      gameName: gameName
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'Registration successful',
      userId: user._id,
      email: user.email,
      gameName: user.gameName
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      userId: user._id,
      email: user.email,
      gameName: user.gameName
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
