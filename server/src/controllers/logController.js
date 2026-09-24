const Log = require('../models/Log');

// @desc    Get system logs
// @route   GET /api/logs
const getLogs = async (req, res, next) => {
  try {
    const { level, category, limit = 100 } = req.query;
    const query = {};
    if (level && level !== 'ALL') query.level = level;
    if (category && category !== 'ALL') query.category = category;

    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10) || 100)
      .populate('userId', 'name email role');

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear logs (Admin only)
// @route   DELETE /api/logs
const clearLogs = async (req, res, next) => {
  try {
    await Log.deleteMany();
    res.json({ success: true, message: 'Logs cleared successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLogs,
  clearLogs
};
