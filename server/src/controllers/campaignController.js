const Campaign = require('../models/Campaign');
const { enqueueCampaign } = require('../services/jobQueueService');
const Log = require('../models/Log');

// @desc    Create & launch a lead generation campaign
// @route   POST /api/campaigns
const createCampaign = async (req, res, next) => {
  try {
    const {
      industry,
      location,
      keywords,
      targetCount = 50,
      minimumRating = 4.0,
      minimumReviews = 20,
      name
    } = req.body;

    if (!industry || !location) {
      return res.status(400).json({ success: false, message: 'Industry and location are required' });
    }

    const campaignKeywords = Array.isArray(keywords)
      ? keywords
      : (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()).filter(Boolean) : []);

    const campaignName = name || `${industry} - ${location} (${new Date().toLocaleDateString()})`;

    const campaign = await Campaign.create({
      name: campaignName,
      industry,
      location,
      keywords: campaignKeywords,
      targetCount: Math.min(100, Math.max(1, Number(targetCount) || 50)),
      minimumRating: Number(minimumRating) || 4.0,
      minimumReviews: Number(minimumReviews) || 20,
      status: 'QUEUED',
      createdBy: req.user?._id,
      progress: {
        stage: 'Queued',
        stepIndex: 0,
        totalSteps: 7,
        current: 0,
        total: Number(targetCount) || 50,
        percentage: 0,
        message: 'Campaign added to processing queue...'
      }
    });

    // Enqueue non-blocking background job
    enqueueCampaign(campaign._id);

    res.status(201).json({
      success: true,
      message: 'Campaign created and queued for asynchronous execution',
      campaign
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all campaigns
// @route   GET /api/campaigns
const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json({ success: true, count: campaigns.length, campaigns });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single campaign with live progress
// @route   GET /api/campaigns/:id
const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    res.json({ success: true, campaign });
  } catch (err) {
    next(err);
  }
};

// @desc    Rerun or retry campaign
// @route   POST /api/campaigns/:id/rerun
const rerunCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    campaign.status = 'QUEUED';
    campaign.error = null;
    campaign.progress = {
      stage: 'Queued',
      stepIndex: 0,
      totalSteps: 7,
      current: 0,
      total: campaign.targetCount,
      percentage: 0,
      message: 'Rerunning campaign...'
    };
    await campaign.save();

    enqueueCampaign(campaign._id);

    res.json({
      success: true,
      message: 'Campaign queued for rerun',
      campaign
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  rerunCampaign
};
