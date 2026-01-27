const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  itemName: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['lost', 'found', 'claimed'],
    required: true 
  },
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  images: [{ 
    type: String 
  }],
  claimRequests: [{
    claimedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    requestDate: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  hostel: String,
  contactInfo: String
}, { 
  timestamps: true 
});

module.exports = mongoose.model('LostFound', lostFoundSchema);