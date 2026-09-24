const { auditWebsite } = require('../services/websiteAuditService');

// @desc    Live Audit any website URL on demand
// @route   POST /api/audit
const auditSingleUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url || url.trim() === '') {
      return res.status(400).json({ success: false, message: 'URL is required for audit' });
    }

    const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const result = await auditWebsite(cleanUrl);

    res.json({
      success: true,
      url: cleanUrl,
      status: result.status,
      audit: result.audit
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  auditSingleUrl
};
