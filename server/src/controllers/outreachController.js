const Outreach = require('../models/Outreach');
const Lead = require('../models/Lead');

// @desc    Get all outreaches
// @route   GET /api/outreach
const getOutreaches = async (req, res, next) => {
  try {
    const { channel, status, leadId } = req.query;
    const query = {};
    if (channel && channel !== 'ALL') query.channel = channel;
    if (status && status !== 'ALL') query.status = status;
    if (leadId) query.leadId = leadId;

    const outreaches = await Outreach.find(query)
      .populate('leadId', 'businessName category phone email stage rating reviewCount score scoreClassification')
      .sort({ sentAt: -1 });

    res.json({ success: true, count: outreaches.length, outreaches });
  } catch (err) {
    next(err);
  }
};

// @desc    Record new outreach interaction
// @route   POST /api/outreach
const createOutreach = async (req, res, next) => {
  try {
    const { leadId, channel, message, followUpDate, status = 'Sent', notes, proposalDetails } = req.body;

    if (!leadId || !message) {
      return res.status(400).json({ success: false, message: 'leadId and message are required' });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const outreach = await Outreach.create({
      leadId,
      channel: channel || 'WhatsApp',
      message,
      followUpDate,
      status,
      notes,
      proposalDetails,
      handledBy: req.user?.name || 'PDC Team'
    });

    // Automatically update lead pipeline stage if applicable
    let newStage = lead.stage;
    if (status === 'Sent' && ['NEW', 'RESEARCHED', 'HOT', 'WARM'].includes(lead.stage)) {
      newStage = 'CONTACTED';
    } else if (status === 'Replied') {
      newStage = 'REPLIED';
    } else if (status === 'Call Scheduled') {
      newStage = 'CALL SCHEDULED';
    } else if (status === 'Proposal Sent') {
      newStage = 'PROPOSAL SENT';
    } else if (status === 'Won') {
      newStage = 'WON';
    } else if (status === 'Lost') {
      newStage = 'LOST';
    }

    if (newStage !== lead.stage) {
      lead.stage = newStage;
      lead.timeline.push({
        action: `Outreach Sent (${channel}) -> Stage ${newStage}`,
        details: message.substring(0, 100),
        user: req.user?.name || 'User',
        timestamp: new Date()
      });
      await lead.save();
    }

    res.status(201).json({ success: true, outreach, leadStage: lead.stage });
  } catch (err) {
    next(err);
  }
};

// @desc    Update outreach status / reply
// @route   PATCH /api/outreach/:id
const updateOutreach = async (req, res, next) => {
  try {
    const outreach = await Outreach.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!outreach) {
      return res.status(404).json({ success: false, message: 'Outreach record not found' });
    }
    res.json({ success: true, outreach });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOutreaches,
  createOutreach,
  updateOutreach
};
