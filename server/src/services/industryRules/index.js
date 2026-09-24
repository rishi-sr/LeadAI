/**
 * Industry-Specific Gap and Opportunity Analyzers
 */

const industryRules = {
  Gym: (lead, audit) => {
    const gaps = [];
    const opportunities = [];
    const recommendedServices = [];

    if (lead.websiteStatus === 'NO WEBSITE') {
      gaps.push('No dedicated owned website to showcase gym facilities and membership tiers');
      gaps.push('No online membership enquiry or lead capture funnels');
      opportunities.push('Convert active Google Maps and social traffic into direct membership enquiries');
      opportunities.push('Build automated WhatsApp trial pass booking for local foot traffic');
      recommendedServices.push('High-Converting Gym Landing Page & Website');
      recommendedServices.push('WhatsApp Automated Lead Capture Bot');
    } else if (lead.websiteStatus === 'BROKEN') {
      gaps.push('Existing website is broken/unreachable, causing lost membership signups');
      opportunities.push('Restore digital presence with modern fast-loading gym portal');
      recommendedServices.push('Website Rebuilding & Performance Optimization');
    } else {
      if (!audit.membershipPlansDetected) {
        gaps.push('Lacks clear, transparent membership pricing or package breakdown');
        opportunities.push('Add interactive membership comparison table with instant joining CTA');
        recommendedServices.push('Membership Pricing & Package Optimization');
      }
      if (!audit.bookingDetected && !audit.leadFormDetected) {
        gaps.push('Missing 1-day free trial or day-pass booking capture form');
        opportunities.push('Introduce instant "Book Free Workout Pass" lead magnet');
        recommendedServices.push('Conversion Rate Optimization & Funnels');
      }
      if (!audit.whatsappDetected) {
        gaps.push('No direct WhatsApp quick-chat widget for rapid trainer/admission queries');
        opportunities.push('Integrate instant WhatsApp concierge widget');
        recommendedServices.push('WhatsApp Lead Automation');
      }
    }

    if (lead.rating >= 4.5 && lead.reviewCount >= 50) {
      opportunities.push(`Leverage stellar Google reputation (${lead.rating}★ across ${lead.reviewCount} reviews) as social proof on landing page`);
    }

    if (lead.instagramStatus === 'ACTIVE') {
      opportunities.push('Bridge Instagram reels/stories audience directly into web membership checkout');
    } else {
      gaps.push('Underutilized social media presence / lack of discoverable Instagram handle');
      recommendedServices.push('Social Media Creative Engine & Content Production');
    }

    return { gaps, opportunities, recommendedServices };
  },

  Restaurant: (lead, audit) => {
    const gaps = [];
    const opportunities = [];
    const recommendedServices = [];

    if (lead.websiteStatus === 'NO WEBSITE') {
      gaps.push('No direct digital menu or direct reservation portal');
      gaps.push('Heavily reliant on third-party aggregators taking high commission margins');
      opportunities.push('Capture direct table bookings and takeaway orders with zero commissions');
      recommendedServices.push('Direct Ordering & Table Reservation Website');
      recommendedServices.push('WhatsApp Interactive Menu System');
    } else if (lead.websiteStatus === 'BROKEN') {
      gaps.push('Customer menu/reservation link is broken, losing dinner reservations');
      recommendedServices.push('Modern Responsive Dine-In Website');
    } else {
      if (!audit.bookingDetected) {
        gaps.push('No instant online table reservation or event booking module');
        opportunities.push('Add online table booking system linked to staff WhatsApp');
        recommendedServices.push('Table Booking & Reservation Flow');
      }
      if (!audit.whatsappDetected) {
        gaps.push('No direct WhatsApp ordering or party enquiry channel');
        recommendedServices.push('WhatsApp Dining Concierge');
      }
    }

    if (lead.rating >= 4.3) {
      opportunities.push('Feature customer food photography and Google top reviews prominently');
    }

    return { gaps, opportunities, recommendedServices };
  },

  Clinic: (lead, audit) => {
    const gaps = [];
    const opportunities = [];
    const recommendedServices = [];

    if (lead.websiteStatus === 'NO WEBSITE') {
      gaps.push('No official clinic portal for patients to view doctor profiles and specialties');
      gaps.push('No digital appointment scheduling or consultation enquiry flow');
      opportunities.push('Establish patient trust with doctor qualifications and clinic facilities');
      opportunities.push('Automate 24/7 appointment scheduling via clinic portal and WhatsApp');
      recommendedServices.push('Healthcare Clinic Website & Doctor Profiles');
      recommendedServices.push('Automated Appointment Booking CRM');
    } else if (lead.websiteStatus === 'BROKEN') {
      gaps.push('Patient portal/website is non-functional, eroding professional healthcare trust');
      recommendedServices.push('Healthcare Website Recovery & HIPAA/Privacy Standards');
    } else {
      if (!audit.bookingDetected) {
        gaps.push('Lacks 1-click patient appointment booking or slot selection');
        opportunities.push('Embed frictionless appointment booking widget');
        recommendedServices.push('Online Appointment Scheduling Module');
      }
      if (!audit.whatsappDetected) {
        gaps.push('No quick WhatsApp clinic helpdesk for prescription queries or emergency timings');
        recommendedServices.push('Healthcare WhatsApp Automation');
      }
    }

    return { gaps, opportunities, recommendedServices };
  },

  'Real Estate': (lead, audit) => {
    const gaps = [];
    const opportunities = [];
    const recommendedServices = [];

    if (lead.websiteStatus === 'NO WEBSITE') {
      gaps.push('No dedicated property listings showcase or digital project brochures');
      gaps.push('Missing high-intent lead capture forms for site visit scheduling');
      opportunities.push('Generate verified buyer leads through dedicated project landing pages');
      recommendedServices.push('Real Estate Project Showcase Portal');
      recommendedServices.push('High-Ticket Lead Generation & CRM Pipeline');
    } else {
      if (!audit.leadFormDetected && !audit.bookingDetected) {
        gaps.push('No instant "Download Brochure" or "Book Site Visit" lead capture gate');
        recommendedServices.push('Brochure Download & Lead Magnet Optimization');
      }
      if (!audit.whatsappDetected) {
        gaps.push('No instant WhatsApp property consultant chat');
        recommendedServices.push('Real Estate WhatsApp Lead Routing');
      }
    }

    return { gaps, opportunities, recommendedServices };
  },

  Salon: (lead, audit) => {
    const gaps = [];
    const opportunities = [];
    const recommendedServices = [];

    if (lead.websiteStatus === 'NO WEBSITE') {
      gaps.push('No online service rate card, treatment menu, or stylist portfolio');
      gaps.push('Missing online appointment slot booking');
      opportunities.push('Attract premium salon clients looking for specialized treatments');
      recommendedServices.push('Luxury Salon Showcase & Booking Website');
      recommendedServices.push('WhatsApp Appointment Scheduling Bot');
    } else {
      if (!audit.bookingDetected) {
        gaps.push('No live chair/slot booking system');
        recommendedServices.push('Online Salon Booking Engine');
      }
    }

    return { gaps, opportunities, recommendedServices };
  }
};

/**
 * General fallback analyzer for any industry
 */
const generalIndustryRule = (lead, audit) => {
  const gaps = [];
  const opportunities = [];
  const recommendedServices = [];

  if (lead.websiteStatus === 'NO WEBSITE') {
    gaps.push(`No verified official website discovered for ${lead.category || 'business'}`);
    gaps.push('Lacks digital brand asset to convert local search discovery into qualified enquiries');
    opportunities.push('Build modern, mobile-first brand presence to outrank local competitors');
    opportunities.push('Establish direct customer inquiry capture with instant WhatsApp routing');
    recommendedServices.push('Custom Website Development');
    recommendedServices.push('WhatsApp CRM & Inbound Lead Management');
  } else if (lead.websiteStatus === 'BROKEN') {
    gaps.push('Business web link is broken or failing to resolve');
    opportunities.push('Rebuild broken web infrastructure to prevent traffic bounce');
    recommendedServices.push('Website Modernization & Repair');
  } else {
    if (!audit.mobileResponsive) {
      gaps.push('Website lacks mobile-friendly responsive optimization');
      recommendedServices.push('Mobile-First Responsive Redesign');
    }
    if (!audit.whatsappDetected) {
      gaps.push('No direct WhatsApp fast-action button');
      recommendedServices.push('WhatsApp Lead Automation');
    }
    if (!audit.leadFormDetected && !audit.bookingDetected) {
      gaps.push('No prominent lead capture forms or call-to-actions');
      recommendedServices.push('Conversion Rate Optimization');
    }
  }

  if (lead.rating >= 4.5) {
    opportunities.push(`Showcase strong local Google reputation (${lead.rating}★ rating) prominently`);
  }

  return { gaps, opportunities, recommendedServices };
};

const analyzeIndustryGaps = (lead, audit = {}) => {
  const handler = industryRules[lead.category] || generalIndustryRule;
  return handler(lead, audit);
};

module.exports = {
  analyzeIndustryGaps
};
