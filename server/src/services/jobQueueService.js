const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const Log = require('../models/Log');
const { discoverBusinesses, filterDuplicates } = require('./placesService');
const { discoverWebsite } = require('./websiteDiscoveryService');
const { auditWebsite } = require('./websiteAuditService');
const { discoverSocialPresence } = require('./socialDiscoveryService');
const { evaluateDigitalPresence } = require('./digitalGapService');
const { calculateLeadScore } = require('./scoringService');
const { generatePitch } = require('./aiService');

const activeJobs = new Map();

/**
 * Updates campaign status and progress in DB
 */
const updateCampaignProgress = async (campaignId, stage, stepIndex, current, total, message) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  
  await Campaign.findByIdAndUpdate(campaignId, {
    status: 'RUNNING',
    progress: {
      stage,
      stepIndex,
      totalSteps: 7,
      current,
      total,
      percentage,
      message
    }
  });
};

/**
 * Runs a full 7-stage Lead Generation Campaign asynchronously
 */
const processCampaignJob = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return;

    activeJobs.set(campaignId.toString(), { status: 'RUNNING', startedAt: new Date() });

    await Log.create({
      level: 'INFO',
      category: 'CAMPAIGN',
      message: `Started asynchronous campaign: "${campaign.name}" (${campaign.industry} in ${campaign.location})`,
      details: { campaignId, targetCount: campaign.targetCount }
    });

    // ==========================================
    // STAGE 1: Finding businesses...
    // ==========================================
    await updateCampaignProgress(
      campaignId,
      'Finding businesses...',
      1,
      0,
      campaign.targetCount,
      `Discovering ${campaign.targetCount} permitted businesses for ${campaign.industry} in ${campaign.location}...`
    );

    const rawBusinesses = await discoverBusinesses({
      industry: campaign.industry,
      location: campaign.location,
      keywords: campaign.keywords,
      targetCount: campaign.targetCount,
      minRating: campaign.minimumRating,
      minReviews: campaign.minimumReviews
    });

    // ==========================================
    // STAGE 2: Collecting info & deduplicating...
    // ==========================================
    await updateCampaignProgress(
      campaignId,
      'Collecting business information...',
      2,
      rawBusinesses.length,
      campaign.targetCount,
      `Deduplicating and collecting metadata for ${rawBusinesses.length} discovered businesses...`
    );

    const { uniqueList } = await filterDuplicates(rawBusinesses);
    const targetList = uniqueList.slice(0, campaign.targetCount);

    if (targetList.length === 0) {
      await Campaign.findByIdAndUpdate(campaignId, {
        status: 'COMPLETED',
        'progress.stage': 'Completed',
        'progress.percentage': 100,
        'progress.message': 'Discovery completed. No new unique businesses found matching criteria.',
        completedAt: new Date()
      });
      activeJobs.delete(campaignId.toString());
      return;
    }

    const processedLeads = [];
    let websitesFoundCount = 0;
    let brokenWebsitesCount = 0;
    let noWebsitesCount = 0;
    let hotCount = 0;
    let warmCount = 0;
    let lowCount = 0;

    // ==========================================
    // STAGE 3 to 7: Process each lead sequentially with progress updates
    // ==========================================
    for (let i = 0; i < targetList.length; i++) {
      const b = targetList[i];
      const indexDisplay = i + 1;

      // STAGE 3: Checking websites...
      await updateCampaignProgress(
        campaignId,
        'Checking websites...',
        3,
        indexDisplay,
        targetList.length,
        `Verifying website for "${b.businessName}" (${indexDisplay}/${targetList.length})...`
      );

      const websiteDiscovery = await discoverWebsite(b);

      // STAGE 4: Finding social profiles...
      await updateCampaignProgress(
        campaignId,
        'Finding social profiles...',
        4,
        indexDisplay,
        targetList.length,
        `Verifying public social presence for "${b.businessName}"...`
      );

      const socialDiscovery = await discoverSocialPresence(b);

      // STAGE 5: Analyzing digital presence & website audit...
      await updateCampaignProgress(
        campaignId,
        'Analyzing digital presence...',
        5,
        indexDisplay,
        targetList.length,
        `Auditing web and digital signals for "${b.businessName}"...`
      );

      let auditResult = { status: 'NO WEBSITE', audit: { checked: true, notes: 'No website' } };
      if (websiteDiscovery.website) {
        auditResult = await auditWebsite(websiteDiscovery.website);
      }

      if (auditResult.status === 'NO WEBSITE') noWebsitesCount++;
      else if (auditResult.status === 'BROKEN') brokenWebsitesCount++;
      else websitesFoundCount++;

      let finalIgUsername = socialDiscovery.instagramUsername;
      let finalIgUrl = socialDiscovery.instagramUrl;
      let finalIgStatus = socialDiscovery.instagramStatus;

      if (auditResult.discoveredSocial?.instagramStatus === 'ACTIVE') {
        finalIgUsername = auditResult.discoveredSocial.instagramUsername;
        finalIgUrl = auditResult.discoveredSocial.instagramUrl;
        finalIgStatus = 'ACTIVE';
      }

      // Construct intermediate lead object for gap analysis
      const partialLead = {
        businessName: b.businessName,
        category: b.businessCategory || campaign.industry,
        location: campaign.location,
        address: b.address,
        city: b.city || campaign.location,
        state: b.state || '',
        country: b.country || 'India',
        phone: b.phone,
        googleMapsUrl: b.googleMapsUrl,
        placeId: b.placeId,
        rating: b.rating,
        reviewCount: b.userRatingCount,
        openingHours: b.openingHours || [],
        latitude: b.latitude,
        longitude: b.longitude,
        website: websiteDiscovery.website,
        websiteStatus: auditResult.status,
        websiteConfidence: websiteDiscovery.websiteConfidence,
        websiteSource: websiteDiscovery.websiteSource,
        instagramUsername: finalIgUsername,
        instagramUrl: finalIgUrl,
        instagramFollowers: socialDiscovery.instagramFollowers || 0,
        instagramStatus: finalIgStatus,
        instagramBio: socialDiscovery.instagramBio || '',
        websiteAudit: auditResult.audit
      };

      // STAGE 6: Generating lead scores...
      await updateCampaignProgress(
        campaignId,
        'Generating lead scores...',
        6,
        indexDisplay,
        targetList.length,
        `Calculating PDC Lead Score for "${b.businessName}"...`
      );

      const digitalEvaluation = evaluateDigitalPresence(partialLead);
      Object.assign(partialLead, digitalEvaluation);

      const scoreResult = await calculateLeadScore(partialLead);
      partialLead.score = scoreResult.score;
      partialLead.scoreClassification = scoreResult.scoreClassification;
      partialLead.scoreBreakdown = scoreResult.scoreBreakdown;

      if (partialLead.scoreClassification === 'HOT') hotCount++;
      else if (partialLead.scoreClassification === 'WARM') warmCount++;
      else lowCount++;

      // STAGE 7: Generating recommendations & AI pitch...
      await updateCampaignProgress(
        campaignId,
        'Generating recommendations...',
        7,
        indexDisplay,
        targetList.length,
        `Synthesizing custom pitch and outreach messages for "${b.businessName}"...`
      );

      const pitchResult = await generatePitch(partialLead);
      partialLead.pitch = pitchResult.pitch;
      partialLead.whatsappMessage = pitchResult.whatsappMessage;
      partialLead.instagramMessage = pitchResult.instagramMessage;
      partialLead.emailMessage = pitchResult.emailMessage;
      partialLead.campaignId = campaignId;
      partialLead.source = 'Google Places Permitted';
      partialLead.stage = 'RESEARCHED';
      partialLead.timeline = [{
        action: 'Lead Researched & Qualified',
        details: `Discovered via Campaign: ${campaign.name}. PDC Score: ${partialLead.score}/100 (${partialLead.scoreClassification})`,
        timestamp: new Date()
      }];

      // Save Lead in DB
      const savedLead = await Lead.create(partialLead);
      processedLeads.push(savedLead);
    }

    // ==========================================
    // CAMPAIGN COMPLETION
    // ==========================================
    await Campaign.findByIdAndUpdate(campaignId, {
      status: 'COMPLETED',
      progress: {
        stage: 'Completed',
        stepIndex: 7,
        totalSteps: 7,
        current: targetList.length,
        total: targetList.length,
        percentage: 100,
        message: `Successfully researched and qualified ${processedLeads.length} leads.`
      },
      stats: {
        totalDiscovered: targetList.length,
        websitesFound: websitesFoundCount,
        brokenWebsites: brokenWebsitesCount,
        noWebsites: noWebsitesCount,
        qualifiedLeads: processedLeads.length,
        hotCount,
        warmCount,
        lowCount
      },
      completedAt: new Date()
    });

    await Log.create({
      level: 'SUCCESS',
      category: 'CAMPAIGN',
      message: `Completed campaign "${campaign.name}". Generated ${processedLeads.length} leads (${hotCount} HOT, ${warmCount} WARM, ${lowCount} LOW).`,
      details: { campaignId, leadsCount: processedLeads.length }
    });

    activeJobs.delete(campaignId.toString());
  } catch (error) {
    console.error('[Campaign Queue Error]:', error);

    await Campaign.findByIdAndUpdate(campaignId, {
      status: 'FAILED',
      error: error.message,
      'progress.message': `Error occurred: ${error.message}`
    });

    await Log.create({
      level: 'ERROR',
      category: 'CAMPAIGN',
      message: `Campaign run failed for ID: ${campaignId}: ${error.message}`,
      details: { error: error.stack }
    });

    activeJobs.delete(campaignId.toString());
  }
};

const enqueueCampaign = (campaignId) => {
  // Fire and forget asynchronously
  setImmediate(() => {
    processCampaignJob(campaignId);
  });
  return { status: 'QUEUED', campaignId };
};

module.exports = {
  enqueueCampaign,
  processCampaignJob
};
