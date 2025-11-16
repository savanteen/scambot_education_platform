const mongoose = require('mongoose');

   const attemptSchema = new mongoose.Schema({
     userId: String,
     score: Number,
     dimensions: {
       rapport_built: Number,
       trust_built: Number,
       guarantee_made: Number,
       skepticism_deflected: Number,
       urgency_created: Number,
       info_requested: Number,
       payment_requested: Number
     },
     completionTime: Number,
     gameResult: String,
     createdAt: { type: Date, default: Date.now }
   });

   module.exports = mongoose.model('Attempt', attemptSchema);
