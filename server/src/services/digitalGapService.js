const { analyzeIndustryGaps } = require('./industryRules');

/**
 * Performs deep digital gap and opportunity analysis for PDC Lead Intelligence
 */
const evaluateDigitalPresence = (lead) => {
  const audit = lead.websiteAudit || {};
  const strengths = [];

  // 1. Evaluate Strengths
  if (lead.rating >= 4.5) {
    strengths.push(`Exceptional Google rating of ${lead.rating}★ reflects high customer satisfaction`);
  } else if (lead.rating >= 4.0) {
    strengths.push(`Solid Google rating of ${lead.rating}★ establishes baseline local trust`);
  }

  if (lead.reviewCount >= 100) {
    strengths.push(`High social proof with ${lead.reviewCount} customer reviews showing strong local market traction`);
  } else if (lead.reviewCount >= 20) {
    strengths.push(`Established review count (${lead.reviewCount} reviews) indicating an active customer base`);
  }

  if (lead.instagramStatus === 'ACTIVE') {
    strengths.push(`Active Instagram presence (@${lead.instagramUsername}) with ~${lead.instagramFollowers || 'engaged'} followers`);
  }

  if (lead.websiteStatus === 'STRONG' || lead.websiteStatus === 'GOOD') {
    if (audit.https) strengths.push('Secure HTTPS protocol enabled');
    if (audit.mobileResponsive) strengths.push('Mobile-responsive layout detected');
    if (audit.whatsappDetected) strengths.push('Direct WhatsApp contact point established');
  }

  // 2. Evaluate Gaps & Opportunities via specialized industry logic
  const industryAnalysis = analyzeIndustryGaps(lead, audit);
  const gaps = [...industryAnalysis.gaps];
  const opportunities = [...industryAnalysis.opportunities];
  const recommendedServices = [...industryAnalysis.recommendedServices];

  // 3. Reason to Contact synthesis
  let reasonToContact = '';
  if (lead.websiteStatus === 'NO WEBSITE') {
    reasonToContact = `Strong local reputation (${lead.rating}★, ${lead.reviewCount} reviews) but missing an owned official website to capture and convert incoming digital traffic.`;
  } else if (lead.websiteStatus === 'BROKEN') {
    reasonToContact = `High rating (${lead.rating}★) but prospective clients encountering a broken website error, directly leaking customer inquiries.`;
  } else if (!audit.whatsappDetected || (!audit.leadFormDetected && !audit.bookingDetected)) {
    reasonToContact = `Established local presence but digital inquiry funnel is missing instant WhatsApp routing and direct conversion CTAs.`;
  } else {
    reasonToContact = `Good existing digital foundation with opportunity to scale brand authority, advanced funnels, and conversion optimization.`;
  }

  // Deduplicate recommendations
  const uniqueServices = Array.from(new Set(recommendedServices));

  return {
    digitalStrengths: strengths,
    digitalGaps: gaps,
    opportunities,
    recommendedServices: uniqueServices,
    reasonToContact
  };
};

module.exports = {
  evaluateDigitalPresence
};
