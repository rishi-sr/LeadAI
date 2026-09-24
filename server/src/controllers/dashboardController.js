const Lead = require('../models/Lead');
const Outreach = require('../models/Outreach');
const Campaign = require('../models/Campaign');

// @desc    Get complete Dashboard KPIs and chart analytics
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalLeads,
      hotLeads,
      warmLeads,
      lowPriorityLeads,
      noWebsiteLeads,
      brokenWebsiteLeads,
      weakDigitalLeads,
      ratingAndReviewsAgg,
      leadsToday,
      stageCountsAgg,
      leadsByDateAgg,
      industryAgg,
      locationAgg,
      sourceAgg,
      websiteStatusAgg,
      outreachStatsAgg
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ scoreClassification: 'HOT' }),
      Lead.countDocuments({ scoreClassification: 'WARM' }),
      Lead.countDocuments({ scoreClassification: 'LOW' }),
      Lead.countDocuments({ websiteStatus: 'NO WEBSITE' }),
      Lead.countDocuments({ websiteStatus: 'BROKEN' }),
      Lead.countDocuments({
        $or: [
          { websiteStatus: { $in: ['NO WEBSITE', 'BROKEN', 'OUTDATED'] } },
          { instagramStatus: { $in: ['NOT FOUND', 'INACTIVE'] } }
        ]
      }),
      Lead.aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            avgReviews: { $avg: '$reviewCount' }
          }
        }
      ]),
      Lead.countDocuments({ createdAt: { $gte: todayStart } }),
      Lead.aggregate([
        { $group: { _id: '$stage', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 14 }
      ]),
      Lead.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      Lead.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      Lead.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Lead.aggregate([
        { $group: { _id: '$websiteStatus', count: { $sum: 1 } } }
      ]),
      Outreach.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    // Map stages
    const stageMap = {};
    stageCountsAgg.forEach(s => { stageMap[s._id] = s.count; });

    const leadsContacted = (stageMap['CONTACTED'] || 0) +
      (stageMap['REPLIED'] || 0) +
      (stageMap['CALL SCHEDULED'] || 0) +
      (stageMap['PROPOSAL SENT'] || 0) +
      (stageMap['NEGOTIATION'] || 0) +
      (stageMap['WON'] || 0) +
      (stageMap['LOST'] || 0);

    const replies = (stageMap['REPLIED'] || 0) + (stageMap['CALL SCHEDULED'] || 0) + (stageMap['PROPOSAL SENT'] || 0) + (stageMap['WON'] || 0);
    const calls = stageMap['CALL SCHEDULED'] || 0;
    const proposals = stageMap['PROPOSAL SENT'] || 0;
    const won = stageMap['WON'] || 0;
    const lost = stageMap['LOST'] || 0;

    const avgRating = ratingAndReviewsAgg[0]?.avgRating ? +ratingAndReviewsAgg[0].avgRating.toFixed(1) : 0;
    const avgReviewCount = ratingAndReviewsAgg[0]?.avgReviews ? Math.round(ratingAndReviewsAgg[0].avgReviews) : 0;

    res.json({
      success: true,
      stats: {
        totalLeads,
        hotLeads,
        warmLeads,
        lowPriorityLeads,
        noWebsite: noWebsiteLeads,
        brokenWebsite: brokenWebsiteLeads,
        weakDigitalPresence: weakDigitalLeads,
        avgRating,
        avgReviewCount,
        leadsGeneratedToday: leadsToday,
        leadsContacted,
        replies,
        calls,
        proposals,
        won,
        lost
      },
      charts: {
        leadsByDate: leadsByDateAgg.map(d => ({ date: d._id, count: d.count })),
        leadSources: sourceAgg.map(s => ({ name: s._id || 'Direct Discovery', count: s.count })),
        industries: industryAgg.map(i => ({ name: i._id || 'Other', count: i.count })),
        locations: locationAgg.map(l => ({ name: l._id || 'Unknown', count: l.count })),
        stages: stageCountsAgg.map(s => ({ name: s._id, count: s.count })),
        websiteStatuses: websiteStatusAgg.map(w => ({ name: w._id || 'UNKNOWN', count: w.count }))
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats
};
