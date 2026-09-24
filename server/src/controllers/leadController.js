const Lead = require('../models/Lead');
const Log = require('../models/Log');
const { exportLeadsToExcel } = require('../services/exportService');
const { auditWebsite } = require('../services/websiteAuditService');
const { discoverWebsite } = require('../services/websiteDiscoveryService');
const { evaluateDigitalPresence } = require('../services/digitalGapService');
const { calculateLeadScore } = require('../services/scoringService');
const { generatePitch } = require('../services/aiService');

// @desc    Get leads with filtering, search, pagination, and sorting
// @route   GET /api/leads
const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      category,
      location,
      minRating,
      minReviews,
      websiteStatus,
      scoreClassification,
      stage,
      instagramStatus,
      campaignId,
      sortBy = 'newest'
    } = req.query;

    const query = {};

    // Search text across name, phone, website, location
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { businessName: searchRegex },
        { phone: searchRegex },
        { website: searchRegex },
        { location: searchRegex },
        { address: searchRegex },
        { instagramUsername: searchRegex }
      ];
    }

    if (category && category !== 'ALL') query.category = category;
    if (location && location !== 'ALL') query.location = location;
    if (websiteStatus && websiteStatus !== 'ALL') query.websiteStatus = websiteStatus;
    if (scoreClassification && scoreClassification !== 'ALL') query.scoreClassification = scoreClassification;
    if (stage && stage !== 'ALL') query.stage = stage;
    if (instagramStatus && instagramStatus !== 'ALL') query.instagramStatus = instagramStatus;
    if (campaignId) query.campaignId = campaignId;

    if (minRating) query.rating = { $gte: Number(minRating) };
    if (minReviews) query.reviewCount = { $gte: Number(minReviews) };

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'score_desc') sortOptions = { score: -1 };
    else if (sortBy === 'reviews_desc') sortOptions = { reviewCount: -1 };
    else if (sortBy === 'rating_desc') sortOptions = { rating: -1 };
    else if (sortBy === 'newest') sortOptions = { createdAt: -1 };
    else if (sortBy === 'oldest') sortOptions = { createdAt: 1 };
    else if (sortBy === 'name_asc') sortOptions = { businessName: 1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('campaignId', 'name');

    res.json({
      success: true,
      count: leads.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      leads
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('campaignId', 'name industry location');
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, lead });
  } catch (err) {
    next(err);
  }
};

// @desc    Update lead (stage, details, notes, etc.)
// @route   PATCH /api/leads/:id
const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const { stage, notes, competitor, contactPerson, email, phone, website } = req.body;

    if (stage && stage !== lead.stage) {
      lead.timeline.push({
        action: `Stage Changed to ${stage}`,
        details: `Updated from ${lead.stage}`,
        user: req.user?.name || 'User',
        timestamp: new Date()
      });
      lead.stage = stage;
    }

    if (competitor !== undefined) lead.competitor = competitor;
    if (contactPerson !== undefined) lead.contactPerson = contactPerson;
    if (email !== undefined) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (website !== undefined) lead.website = website;

    if (notes && typeof notes === 'string') {
      lead.notes.push({
        text: notes,
        author: req.user?.name || 'PDC Agent',
        createdAt: new Date()
      });
    }

    await lead.save();
    res.json({ success: true, message: 'Lead updated successfully', lead });
  } catch (err) {
    next(err);
  }
};

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
const addNote = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.notes.push({
      text: text.trim(),
      author: req.user?.name || 'PDC Agent',
      createdAt: new Date()
    });

    lead.timeline.push({
      action: 'Note Added',
      details: text.trim().substring(0, 80),
      user: req.user?.name || 'User',
      timestamp: new Date()
    });

    await lead.save();
    res.json({ success: true, notes: lead.notes });
  } catch (err) {
    next(err);
  }
};

// @desc    Re-analyze lead website & digital gaps
// @route   POST /api/leads/:id/analyze
const analyzeLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // 1. If website explicitly provided in request body, adopt it
    if (req.body.website && req.body.website.trim() !== '') {
      let raw = req.body.website.trim();
      lead.website = raw.startsWith('http') ? raw : `https://${raw}`;
      lead.websiteSource = 'USER_SPECIFIED';
    }

    // 2. If phone explicitly provided, adopt it
    if (req.body.phone && req.body.phone.trim() !== '') {
      lead.phone = req.body.phone.trim();
    }

    // 3. If website is missing, run automated domain resolution & discovery
    if (!lead.website || lead.website.trim() === '' || lead.website === 'NOT FOUND') {
      const discovery = await discoverWebsite(lead);
      if (discovery.website) {
        lead.website = discovery.website;
        lead.websiteConfidence = discovery.websiteConfidence;
        lead.websiteSource = discovery.websiteSource;
      }
    }

    // 4. Audit website if available
    if (lead.website && lead.website.trim() !== '' && lead.website !== 'NOT FOUND') {
      const auditResult = await auditWebsite(lead.website);
      lead.websiteStatus = auditResult.status;
      lead.websiteAudit = auditResult.audit;

      // Also adopt verified social handles discovered on website if not already set
      if (auditResult.discoveredSocial?.instagramStatus === 'ACTIVE') {
        lead.instagramUsername = auditResult.discoveredSocial.instagramUsername;
        lead.instagramUrl = auditResult.discoveredSocial.instagramUrl;
        lead.instagramStatus = 'ACTIVE';
      }
    } else {
      lead.websiteStatus = 'NO WEBSITE';
      lead.websiteAudit = {
        checked: true,
        checkedAt: new Date(),
        statusCode: 0,
        https: false,
        mobileResponsive: false,
        notes: 'No website registered or discovered'
      };
    }

    // 5. Re-evaluate gaps
    const gapData = evaluateDigitalPresence(lead);
    Object.assign(lead, gapData);

    // 6. Re-calculate score
    const scoreData = await calculateLeadScore(lead);
    lead.score = scoreData.score;
    lead.scoreClassification = scoreData.scoreClassification;
    lead.scoreBreakdown = scoreData.scoreBreakdown;

    // 7. Regenerate pitch to reflect updated website/audit signals
    const pitchData = await generatePitch(lead);
    lead.pitch = pitchData.pitch;
    lead.whatsappMessage = pitchData.whatsappMessage;
    lead.instagramMessage = pitchData.instagramMessage;
    lead.emailMessage = pitchData.emailMessage;

    lead.timeline.push({
      action: 'Lead Re-analyzed',
      details: `Updated Audit & Score: ${lead.score}/100 (${lead.scoreClassification})${lead.website ? ` | Website: ${lead.website}` : ''}`,
      user: req.user?.name || 'User',
      timestamp: new Date()
    });

    await lead.save();
    res.json({ success: true, message: 'Lead re-analyzed successfully', lead });
  } catch (err) {
    next(err);
  }
};

// @desc    Regenerate AI Pitch
// @route   POST /api/leads/:id/generate-pitch
const generateLeadPitch = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const pitchData = await generatePitch(lead);
    lead.pitch = pitchData.pitch;
    lead.whatsappMessage = pitchData.whatsappMessage;
    lead.instagramMessage = pitchData.instagramMessage;
    lead.emailMessage = pitchData.emailMessage;

    lead.timeline.push({
      action: 'AI Pitch Regenerated',
      details: 'Synthesized fresh observation, problem, WhatsApp, and email copy',
      user: req.user?.name || 'User',
      timestamp: new Date()
    });

    await lead.save();
    res.json({
      success: true,
      message: 'Pitch regenerated successfully',
      pitch: lead.pitch,
      whatsappMessage: lead.whatsappMessage,
      instagramMessage: lead.instagramMessage,
      emailMessage: lead.emailMessage
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk update stage for multiple leads
// @route   POST /api/leads/bulk-stage
const bulkUpdateStage = async (req, res, next) => {
  try {
    const { leadIds, stage } = req.body;
    if (!Array.isArray(leadIds) || !stage) {
      return res.status(400).json({ success: false, message: 'leadIds array and stage are required' });
    }

    await Lead.updateMany(
      { _id: { $in: leadIds } },
      {
        $set: { stage },
        $push: {
          timeline: {
            action: `Bulk Stage Update: ${stage}`,
            user: req.user?.name || 'User',
            timestamp: new Date()
          }
        }
      }
    );

    res.json({ success: true, message: `Updated ${leadIds.length} leads to stage '${stage}'` });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete single lead
// @route   DELETE /api/leads/:id
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Export leads to Excel (.xlsx) matching PDC Template
// @route   GET /api/leads/export
const exportLeads = async (req, res, next) => {
  try {
    const {
      ids,
      category,
      location,
      websiteStatus,
      scoreClassification,
      stage,
      search
    } = req.query;

    let query = {};

    if (ids && ids.trim() !== '') {
      const idArray = ids.split(',').map(id => id.trim()).filter(Boolean);
      query._id = { $in: idArray };
    } else {
      if (search && search.trim() !== '') {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { businessName: searchRegex },
          { phone: searchRegex },
          { location: searchRegex }
        ];
      }
      if (category && category !== 'ALL') query.category = category;
      if (location && location !== 'ALL') query.location = location;
      if (websiteStatus && websiteStatus !== 'ALL') query.websiteStatus = websiteStatus;
      if (scoreClassification && scoreClassification !== 'ALL') query.scoreClassification = scoreClassification;
      if (stage && stage !== 'ALL') query.stage = stage;
    }

    const leads = await Lead.find(query).sort({ score: -1, createdAt: -1 });

    const buffer = await exportLeadsToExcel(leads);

    await Log.create({
      level: 'INFO',
      category: 'EXPORT',
      message: `Exported ${leads.length} leads to Excel template`,
      details: { count: leads.length, filterApplied: Boolean(ids || category || location) },
      userId: req.user?._id
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `PDC_Lead_Intelligence_Export_${timestamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  updateLead,
  addNote,
  analyzeLead,
  generateLeadPitch,
  bulkUpdateStage,
  deleteLead,
  exportLeads
};
