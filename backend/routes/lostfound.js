const express = require('express');
const LostFound = require('../models/LostFound');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadToCloudinary = require('../config/uploadToCloudinary');

const router = express.Router();

// @route   POST /api/lostfound
// @desc    Report lost or found item
// @access  Private
router.post('/', auth, upload.array('images', 3), async (req, res) => {
  try {
    const { itemName, description, location, status, contactInfo } = req.body;

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'hostel-tracker/lostfound');
        imageUrls.push(url);
      }
    }

    const item = new LostFound({
      itemName,
      description,
      location,
      status,
      reportedBy: req.user._id,
      images: imageUrls,
      hostel: req.user.hostel,
      contactInfo: contactInfo || req.user.phone
    });

    await item.save();
    await item.populate('reportedBy', 'name email phone hostel');

    res.status(201).json({
      message: 'Item reported successfully',
      item
    });

  } catch (error) {
    console.error('Create lost/found error:', error);
    res.status(500).json({ error: 'Failed to report item' });
  }
});

// @route   GET /api/lostfound
// @desc    Get all lost/found items
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by hostel (students see only their hostel)
    if (req.user.role === 'student') {
      query.hostel = req.user.hostel;
    }

    // Search
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await LostFound.find(query)
      .populate('reportedBy', 'name email phone hostel')
      .populate('claimRequests.claimedBy', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      count: items.length,
      items
    });

  } catch (error) {
    console.error('Get lost/found error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// @route   GET /api/lostfound/:id
// @desc    Get single lost/found item
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id)
      .populate('reportedBy', 'name email phone hostel block roomNumber')
      .populate('claimRequests.claimedBy', 'name email phone hostel');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);

  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// @route   POST /api/lostfound/:id/claim
// @desc    Claim a lost/found item
// @access  Private
router.post('/:id/claim', auth, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.status === 'claimed') {
      return res.status(400).json({ error: 'Item already claimed' });
    }

    // Check if user already claimed
    const alreadyClaimed = item.claimRequests.some(
      claim => claim.claimedBy.toString() === req.user._id.toString()
    );

    if (alreadyClaimed) {
      return res.status(400).json({ error: 'You have already submitted a claim request' });
    }

    item.claimRequests.push({
      claimedBy: req.user._id,
      status: 'pending'
    });

    await item.save();
    await item.populate('claimRequests.claimedBy', 'name email phone');

    res.json({
      message: 'Claim request submitted successfully',
      item
    });

  } catch (error) {
    console.error('Claim item error:', error);
    res.status(500).json({ error: 'Failed to claim item' });
  }
});

// @route   PATCH /api/lostfound/:id/claim/:claimId
// @desc    Approve or reject claim (Management or item reporter)
// @access  Private - Management or Reporter
router.patch('/:id/claim/:claimId', auth, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check authorization
    const isReporter = item.reportedBy.toString() === req.user._id.toString();
    const isManagement = req.user.role === 'management';

    if (!isReporter && !isManagement) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const claim = item.claimRequests.id(req.params.claimId);

    if (!claim) {
      return res.status(404).json({ error: 'Claim request not found' });
    }

    claim.status = status;

    if (status === 'approved') {
      item.status = 'claimed';
    }

    await item.save();
    await item.populate('claimRequests.claimedBy', 'name email phone');

    res.json({
      message: `Claim ${status} successfully`,
      item
    });

  } catch (error) {
    console.error('Update claim error:', error);
    res.status(500).json({ error: 'Failed to update claim' });
  }
});

// @route   PATCH /api/lostfound/:id
// @desc    Update lost/found item
// @access  Private - Reporter or Management
router.patch('/:id', auth, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const isReporter = item.reportedBy.toString() === req.user._id.toString();
    const isManagement = req.user.role === 'management';

    if (!isReporter && !isManagement) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { itemName, description, location, status, contactInfo } = req.body;

    if (itemName) item.itemName = itemName;
    if (description) item.description = description;
    if (location) item.location = location;
    if (status) item.status = status;
    if (contactInfo) item.contactInfo = contactInfo;

    await item.save();
    await item.populate('reportedBy', 'name email phone');

    res.json({
      message: 'Item updated successfully',
      item
    });

  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// @route   DELETE /api/lostfound/:id
// @desc    Delete lost/found item
// @access  Private - Reporter or Management
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const isReporter = item.reportedBy.toString() === req.user._id.toString();
    const isManagement = req.user.role === 'management';

    if (!isReporter && !isManagement) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await LostFound.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });

  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;