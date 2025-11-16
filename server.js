// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./routes/users');
const chatbotRoutes = require('./routes/chatbot');

const app = express(); // ← You missed this line!

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://6919dbb20bc0e0d1e6e8c91f--scamboteducation.netlify.app/'
    'https://6919e26589d6820008adce2d--scamboteducation.netlify.app/'
    'https://scamboteducation.netlify.app'
  ],
  credentials: true
}));

app.use(express.json()); // ← You missed this line too!

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  console.log('App will continue without database (using in-memory storage)');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Scambot Education API is running');
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Health check for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {  // Also add '0.0.0.0' here
  console.log(`🚀 Server running on port ${PORT}`);
});


// Keep the process alive
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, but staying alive...');
});

// Ping yourself to stay active
setInterval(() => {
  console.log('🟢 Server heartbeat:', new Date().toISOString());
}, 30000); // Every 30 seconds



