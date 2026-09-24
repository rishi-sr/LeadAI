const Settings = require('../models/Settings');
const { defaultLeadScoreRules } = require('../config/defaultSettings');

/**
 * Calculates transparent internal PDC Lead Score based on configurable weights
 */
const calculateLeadScore = async (lead) => {
  let rules = defaultLeadScoreRules;

  try {
    const settings = await Settings.findOne();
    if (settings && settings.leadScoreRules) {
      rules = { ...defaultLeadScoreRules, ...settings.leadScoreRules };
    }
  } catch (err) {
    // Fallback to default rules
  }

  let totalScore = 0;
  const breakdown = [];
  const audit = lead.websiteAudit || {};

  // Rule 1: Website Presence
  if (lead.websiteStatus === 'NO WEBSITE') {
    const pts = Number(rules.noWebsite) || 30;
    totalScore += pts;
    breakdown.push({
      rule: 'No Website Identified',
      points: pts,
      reason: 'Missing owned digital hub presents high-value website development opportunity'
    });
  } else if (lead.websiteStatus === 'BROKEN') {
    const pts = Number(rules.brokenWebsite) || 25;
    totalScore += pts;
    breakdown.push({
      rule: 'Broken Website Detected',
      points: pts,
      reason: 'Technical breakdown directly harming inbound conversion and client trust'
    });
  } else if (lead.websiteStatus === 'STRONG') {
    const pts = Number(rules.strongExistingWebsite) || -30;
    totalScore += pts;
    breakdown.push({
      rule: 'Strong Existing Website',
      points: pts,
      reason: 'Already possesses well-maintained digital infrastructure, lower priority for core web'
    });
  }

  // Rule 2: Active Instagram
  if (lead.instagramStatus === 'ACTIVE') {
    const pts = Number(rules.activeInstagram) || 15;
    totalScore += pts;
    breakdown.push({
      rule: 'Active Social Presence',
      points: pts,
      reason: 'Active social audience demonstrates brand value and ability to convert to web funnels'
    });
  }

  // Rule 3: Review Count
  const reviewThreshold = Number(rules.highReviewThreshold) || 50;
  if ((lead.reviewCount || 0) >= reviewThreshold) {
    const pts = Number(rules.highReviewCount) || 10;
    totalScore += pts;
    breakdown.push({
      rule: `High Customer Reviews (>= ${reviewThreshold})`,
      points: pts,
      reason: 'Established customer flow and established local business revenue'
    });
  }

  // Rule 4: Strong Google Rating
  const ratingThreshold = Number(rules.strongRatingThreshold) || 4.5;
  if ((lead.rating || 0) >= ratingThreshold) {
    const pts = Number(rules.strongGoogleRating) || 10;
    totalScore += pts;
    breakdown.push({
      rule: `Strong Local Reputation (>= ${ratingThreshold}★)`,
      points: pts,
      reason: 'High ratings mean clients already love the service; prime candidate for growth'
    });
  }

  // Rule 5: Conversion CTAs
  if (lead.websiteStatus !== 'NO WEBSITE' && lead.websiteStatus !== 'BROKEN') {
    if (!audit.ctaDetected && !audit.leadFormDetected && !audit.bookingDetected) {
      const pts = Number(rules.noEnquiryCta) || 10;
      totalScore += pts;
      breakdown.push({
        rule: 'Missing Clear Enquiry CTA',
        points: pts,
        reason: 'Website has traffic but no prominent conversion action or lead capture form'
      });
    }

    if (!audit.pricingDetected && !audit.membershipPlansDetected) {
      const pts = Number(rules.noPricingOrMembership) || 5;
      totalScore += pts;
      breakdown.push({
        rule: 'No Pricing / Membership Information',
        points: pts,
        reason: 'Lack of pricing transparency causes friction and customer drop-off'
      });
    }

    if (!audit.whatsappDetected) {
      const pts = Number(rules.noWhatsAppCta) || 5;
      totalScore += pts;
      breakdown.push({
        rule: 'Missing WhatsApp Direct Routing',
        points: pts,
        reason: 'No frictionless 1-tap WhatsApp channel for mobile users'
      });
    }

    if (audit.mobileResponsive && audit.https && audit.whatsappDetected && audit.leadFormDetected) {
      const pts = Number(rules.modernDigitalPresence) || -25;
      totalScore += pts;
      breakdown.push({
        rule: 'Modern Digital Presence Detected',
        points: pts,
        reason: 'Modern responsive website with active contact points already in place'
      });
    }
  }

  // Clamp score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, totalScore));

  const hotThreshold = Number(rules.thresholdHot) || 80;
  const warmThreshold = Number(rules.thresholdWarm) || 60;

  let classification = 'LOW';
  if (normalizedScore >= hotThreshold) {
    classification = 'HOT';
  } else if (normalizedScore >= warmThreshold) {
    classification = 'WARM';
  } else {
    classification = 'LOW';
  }

  return {
    score: normalizedScore,
    scoreClassification: classification,
    scoreBreakdown: breakdown
  };
};

module.exports = {
  calculateLeadScore
};
