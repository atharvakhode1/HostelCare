const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  targetHostels: [{ 
    type: String 
  }],
  targetBlocks: [{ 
    type: String 
  }],
  targetRoles: [{ 
    type: String,
    enum: ['student', 'staff', 'management']
  }],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Announcement', announcementSchema);