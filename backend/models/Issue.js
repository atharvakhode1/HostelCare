const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['plumbing', 'electrical', 'cleanliness', 'internet', 'furniture', 'other'],
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'emergency'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['reported', 'assigned', 'in-progress', 'resolved', 'closed'],
    default: 'reported' 
  },
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  hostel: { 
    type: String, 
    required: true 
  },
  block: { 
    type: String, 
    required: true 
  },
  room: { 
    type: String 
  },
  media: [{ 
    type: String  // Cloudinary URLs
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['reported', 'assigned', 'in-progress', 'resolved', 'closed']
    },
    changedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    remarks: String
  }],
  comments: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    text: String,
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }],
  upvotes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Issue', issueSchema);