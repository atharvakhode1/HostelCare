const express = require('express');
const Issue = require('../models/Issue');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadToCloudinary = require('../config/uploadToCloudinary');

const router = express.Router();

// @route   POST /api/issues
// @desc    Create new issue
// @access  Private
router.post('/', auth, upload.array('media', 5), async (req, res) => {
  try {
    const { title, description, category, priority, isPublic } = req.body;

    // Upload files to Cloudinary
    const mediaUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        mediaUrls.push(url);
      }
    }

    const issue = new Issue({
      title,
      description,
      category,
      priority,
      isPublic: isPublic === 'true' || isPublic === true,
      reportedBy: req.user._id,
      hostel: req.user.hostel,
      block: req.user.block,
      room: req.user.roomNumber,
      media: mediaUrls,
      statusHistory: [{
        status: 'reported',
        changedBy: req.user._id,
        remarks: 'Issue created'
      }]
    });

    await issue.save();
    await issue.populate('reportedBy', 'name email hostel block roomNumber');

    res.status(201).json({
      message: 'Issue created successfully',
      issue
    });

  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Failed to create issue', details: error.message });
  }
});

// @route   GET /api/issues
// @desc    Get all issues (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, hostel, block, search } = req.query;
    
    let query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      query.$or = [
        { reportedBy: req.user._id },
        { isPublic: true, hostel: req.user.hostel }
      ];
    } else if (req.user.role === 'staff') {
      query.assignedTo = req.user._id;
    }

    // Additional filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (hostel && req.user.role === 'management') query.hostel = hostel;
    if (block && req.user.role === 'management') query.block = block;
    
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email hostel block roomNumber')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      count: issues.length,
      issues
    });

  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// @route   GET /api/issues/:id
// @desc    Get single issue
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email hostel block roomNumber phone')
      .populate('assignedTo', 'name email phone')
      .populate('comments.user', 'name role')
      .populate('statusHistory.changedBy', 'name role');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check access permission
    const isReporter = issue.reportedBy._id.toString() === req.user._id.toString();
    const isAssigned = issue.assignedTo && issue.assignedTo._id.toString() === req.user._id.toString();
    const isManagement = req.user.role === 'management';
    const isPublicInSameHostel = issue.isPublic && issue.hostel === req.user.hostel;

    if (!isReporter && !isAssigned && !isManagement && !isPublicInSameHostel) {
      return res.status(403).json({ error: 'Access denied to this issue' });
    }

    res.json(issue);

  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

// @route   PATCH /api/issues/:id/status
// @desc    Update issue status
// @access  Private - Staff & Management
router.patch('/:id/status', auth, authorize('staff', 'management'), async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Staff can only update issues assigned to them
    if (req.user.role === 'staff') {
      if (!issue.assignedTo || issue.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'You can only update issues assigned to you' });
      }
    }

    issue.status = status;
    issue.statusHistory.push({
      status,
      changedBy: req.user._id,
      remarks: remarks || `Status changed to ${status}`
    });

    await issue.save();
    await issue.populate('reportedBy assignedTo statusHistory.changedBy');

    res.json({
      message: 'Status updated successfully',
      issue
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// @route   PATCH /api/issues/:id/assign
// @desc    Assign issue to staff
// @access  Private - Management only
router.patch('/:id/assign', auth, authorize('management'), async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo,
        status: 'assigned',
        $push: {
          statusHistory: {
            status: 'assigned',
            changedBy: req.user._id,
            remarks: 'Issue assigned to staff member'
          }
        }
      },
      { new: true }
    ).populate('reportedBy assignedTo');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({
      message: 'Issue assigned successfully',
      issue
    });

  } catch (error) {
    console.error('Assign issue error:', error);
    res.status(500).json({ error: 'Failed to assign issue' });
  }
});

// @route   POST /api/issues/:id/comment
// @desc    Add comment to issue
// @access  Private
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check if user can comment
    if (!issue.isPublic && 
        req.user.role === 'student' && 
        issue.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Cannot comment on private issues' });
    }

    issue.comments.push({ 
      user: req.user._id, 
      text: text.trim() 
    });

    await issue.save();
    await issue.populate('comments.user', 'name role');

    res.json({
      message: 'Comment added successfully',
      comments: issue.comments
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// @route   POST /api/issues/:id/upvote
// @desc    Upvote/downvote issue
// @access  Private
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (!issue.isPublic) {
      return res.status(403).json({ error: 'Cannot upvote private issues' });
    }

    const upvoteIndex = issue.upvotes.indexOf(req.user._id);
    
    if (upvoteIndex > -1) {
      // Remove upvote
      issue.upvotes.splice(upvoteIndex, 1);
    } else {
      // Add upvote
      issue.upvotes.push(req.user._id);
    }

    await issue.save();

    res.json({ 
      message: upvoteIndex > -1 ? 'Upvote removed' : 'Upvoted successfully',
      upvotes: issue.upvotes.length,
      hasUpvoted: upvoteIndex === -1
    });

  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ error: 'Failed to upvote issue' });
  }
});

// @route   DELETE /api/issues/:id
// @desc    Delete issue
// @access  Private - Management or issue reporter
router.delete('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Only management or the person who reported can delete
    const isReporter = issue.reportedBy.toString() === req.user._id.toString();
    const isManagement = req.user.role === 'management';

    if (!isReporter && !isManagement) {
      return res.status(403).json({ error: 'Not authorized to delete this issue' });
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.json({ message: 'Issue deleted successfully' });

  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Failed to delete issue' });
  }
});

module.exports = router;

