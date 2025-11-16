// routes/chatbot.js - MongoDB version with best score tracking
const express = require('express');
const router = express.Router();
const Attempt = require('../models/Attempt');
const User = require('../models/User');

// Start a new attempt
router.post('/start', (req, res) => {
  console.log('Start endpoint hit');
  res.json({
    message: 'Game started',
    attemptId: 'game-' + Date.now(),
    initialMessage: {
      sender: 'bot',
      content: 'Hello, this is Robert Johnson. Who am I speaking with?',
      timestamp: new Date()
    }
  });
});

// Process a message
router.post('/message', (req, res) => {
  console.log('Message endpoint hit');
  res.json({
    response: "That's interesting! Tell me more about this investment opportunity.",
    dimensionUpdates: {},
    gameCompleted: false,
    timeLeft: 120
  });
});

// Submit score to leaderboard
router.post('/leaderboard', async (req, res) => {
  try {
    console.log('Submit to leaderboard endpoint hit');
    console.log('Request body:', req.body);
    
    const { userId, email, gameName, score, completionTime, dimensions, gameResult } = req.body;
    
    // Validate required fields
    if (!email || !gameName || score === undefined || completionTime === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: email, gameName, score, completionTime' 
      });
    }
    
    // Count attempts by this player (email)
    const previousAttempts = await Attempt.countDocuments({ email: email.toLowerCase() });
    const attemptNumber = previousAttempts + 1;
    
    // Create new attempt
    const newAttempt = new Attempt({
      email: email.toLowerCase(),
      gameName: gameName,
      score: Number(score),
      completionTime: Number(completionTime),
      dimensions: dimensions || {},
      attemptNumber: attemptNumber,
      gameResult: gameResult || 'success',
      timestamp: new Date()
    });
    
    await newAttempt.save();
    
    console.log('Attempt saved successfully:', {
      email: newAttempt.email,
      gameName: newAttempt.gameName,
      score: newAttempt.score,
      attemptNumber: newAttempt.attemptNumber
    });
    
    // Get updated leaderboard
    const leaderboard = await getLeaderboard();
    
    res.json({ 
      message: 'Score submitted successfully',
      attemptNumber: attemptNumber,
      leaderboard: leaderboard
    });
    
  } catch (error) {
    console.error('Error submitting to leaderboard:', error);
    res.status(500).json({ 
      message: 'Error submitting score',
      error: error.message 
    });
  }
});

// Get leaderboard (best score per player)
router.get('/leaderboard', async (req, res) => {
  try {
    console.log('Get leaderboard endpoint hit');
    
    const leaderboard = await getLeaderboard();
    
    res.json(leaderboard);
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      message: 'Error fetching leaderboard',
      error: error.message 
    });
  }
});

// Helper function to get leaderboard
async function getLeaderboard() {
  // Aggregate to get best score per player
  const leaderboard = await Attempt.aggregate([
    {
      // Group by email
      $group: {
        _id: '$email',
        gameName: { $first: '$gameName' },
        bestScore: { $max: '$score' },
        totalAttempts: { $sum: 1 },
        // Get the completion time of the best score
        attempts: { 
          $push: { 
            score: '$score', 
            completionTime: '$completionTime',
            timestamp: '$timestamp'
          } 
        }
      }
    },
    {
      // Find the fastest time for the best score
      $project: {
        email: '$_id',
        gameName: 1,
        bestScore: 1,
        totalAttempts: 1,
        bestTime: {
          $min: {
            $map: {
              input: {
                $filter: {
                  input: '$attempts',
                  as: 'attempt',
                  cond: { $eq: ['$$attempt.score', '$bestScore'] }
                }
              },
              as: 'filtered',
              in: '$$filtered.completionTime'
            }
          }
        }
      }
    },
    {
      // Sort by score (desc), then time (asc) for ties
      $sort: { bestScore: -1, bestTime: 1 }
    },
    {
      // Limit to top 10
      $limit: 10
    },
    {
      // Format output
      $project: {
        _id: 0,
        email: 1,
        gameName: 1,
        score: '$bestScore',
        completionTime: '$bestTime',
        totalAttempts: 1
      }
    }
  ]);
  
  return leaderboard;
}

// Reset leaderboard (admin only)
router.post('/reset-leaderboard', async (req, res) => {
  try {
    console.log('Reset leaderboard endpoint hit');
    
    const { passcode } = req.body;
    
    // Verify admin password
    if (passcode !== 'resetNYJC') {
      console.log('Invalid passcode attempt');
      return res.status(403).json({ 
        message: 'Invalid password. Only admins can reset the leaderboard.' 
      });
    }
    
    // Delete all attempts
    const result = await Attempt.deleteMany({});
    
    console.log(`Leaderboard cleared by admin. ${result.deletedCount} attempts deleted.`);
    
    res.json({ 
      message: 'Leaderboard reset successfully',
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    res.status(500).json({ 
      message: 'Error resetting leaderboard',
      error: error.message 
    });
  }
});

module.exports = router;