const express = require('express');
const Announcement = require('../models/Announcement');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/announcements
// @desc    Create announcement
// @access  Private - Management only
router.post('/', auth, authorize('management'), async (req, res) => {
  try {
    const { title, content, targetHostels, targetBlocks, targetRoles } = req.body;

    const announcement = new Announcement({
      title,
      content,
      targetHostels: targetHostels || [],
      targetBlocks: targetBlocks || [],
      targetRoles: targetRoles || ['student', 'staff'],
      createdBy: req.user._id
    });

    await announcement.save();
    await announcement.populate('createdBy', 'name role');

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// @route   GET /api/announcements
// @desc    Get announcements (filtered by user hostel/role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = { isActive: true };

    // Filter by user's hostel and role
    query.$or = [
      { targetHostels: { $size: 0 } }, // All hostels
      { targetHostels: req.user.hostel }
    ];

    query.$and = [
      {
        $or: [
          { targetRoles: { $size: 0 } }, // All roles
          { targetRoles: req.user.role }
        ]
      }
    ];

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      count: announcements.length,
      announcements
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get single announcement
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name role');

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(announcement);

  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
});

// @route   PATCH /api/announcements/:id
// @desc    Update announcement
// @access  Private - Management only
router.patch('/:id', auth, authorize('management'), async (req, res) => {
  try {
    const { title, content, targetHostels, targetBlocks, targetRoles, isActive } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, content, targetHostels, targetBlocks, targetRoles, isActive },
      { new: true }
    ).populate('createdBy', 'name role');

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({
      message: 'Announcement updated successfully',
      announcement
    });

  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private - Management only
router.delete('/:id', auth, authorize('management'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });

  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;