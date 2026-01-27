const express = require('express');
const Issue = require('../models/Issue');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get analytics overview
// @access  Private - Management only
router.get('/overview', auth, authorize('management'), async (req, res) => {
  try {
    const { hostel, startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let hostelFilter = {};
    if (hostel) {
      hostelFilter.hostel = hostel;
    }

    const filter = { ...dateFilter, ...hostelFilter };

    // Total issues count
    const totalIssues = await Issue.countDocuments(filter);

    // Issues by status
    const issuesByStatus = await Issue.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Issues by category
    const issuesByCategory = await Issue.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Issues by priority
    const issuesByPriority = await Issue.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Issues by hostel
    const issuesByHostel = await Issue.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$hostel', count: { $sum: 1 } } }
    ]);

    // Issues by block
    const issuesByBlock = await Issue.aggregate([
      { $match: filter },
      { $group: { _id: { hostel: '$hostel', block: '$block' }, count: { $sum: 1 } } }
    ]);

    // Average resolution time
    const resolvedIssues = await Issue.find({ 
      ...filter, 
      status: { $in: ['resolved', 'closed'] } 
    }).select('createdAt statusHistory');

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    resolvedIssues.forEach(issue => {
      const resolvedEntry = issue.statusHistory.find(
        h => h.status === 'resolved' || h.status === 'closed'
      );
      if (resolvedEntry) {
        const timeDiff = resolvedEntry.timestamp - issue.createdAt;
        totalResolutionTime += timeDiff;
        resolvedCount++;
      }
    });

    const avgResolutionTime = resolvedCount > 0 
      ? totalResolutionTime / resolvedCount / (1000 * 60 * 60) // Convert to hours
      : 0;

    res.json({
      totalIssues,
      issuesByStatus: issuesByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      issuesByCategory: issuesByCategory.map(item => ({
        category: item._id,
        count: item.count
      })),
      issuesByPriority: issuesByPriority.map(item => ({
        priority: item._id,
        count: item.count
      })),
      issuesByHostel: issuesByHostel.map(item => ({
        hostel: item._id,
        count: item.count
      })),
      issuesByBlock: issuesByBlock.map(item => ({
        hostel: item._id.hostel,
        block: item._id.block,
        count: item.count
      })),
      avgResolutionTimeHours: Math.round(avgResolutionTime * 10) / 10,
      resolvedCount
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get issue trends over time
// @access  Private - Management only
router.get('/trends', auth, authorize('management'), async (req, res) => {
  try {
    const { days = 30, hostel } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let filter = { createdAt: { $gte: startDate } };
    if (hostel) filter.hostel = hostel;

    const trendData = await Issue.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      period: `${days} days`,
      trends: trendData.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        count: item.count
      }))
    });

  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// @route   GET /api/analytics/top-issues
// @desc    Get most upvoted/commented issues
// @access  Private - Management only
router.get('/top-issues', auth, authorize('management'), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Most upvoted issues
    const mostUpvoted = await Issue.find({ isPublic: true })
      .select('title category priority upvotes createdAt hostel')
      .populate('reportedBy', 'name')
      .sort({ upvotes: -1 })
      .limit(parseInt(limit));

    // Most commented issues
    const mostCommented = await Issue.find({ isPublic: true })
      .select('title category priority comments createdAt hostel')
      .populate('reportedBy', 'name')
      .sort({ 'comments.length': -1 })
      .limit(parseInt(limit));

    res.json({
      mostUpvoted: mostUpvoted.map(issue => ({
        id: issue._id,
        title: issue.title,
        category: issue.category,
        priority: issue.priority,
        upvotes: issue.upvotes.length,
        hostel: issue.hostel,
        createdAt: issue.createdAt
      })),
      mostCommented: mostCommented.map(issue => ({
        id: issue._id,
        title: issue.title,
        category: issue.category,
        priority: issue.priority,
        comments: issue.comments.length,
        hostel: issue.hostel,
        createdAt: issue.createdAt
      }))
    });

  } catch (error) {
    console.error('Top issues error:', error);
    res.status(500).json({ error: 'Failed to fetch top issues' });
  }
});

module.exports = router;