module.exports = {
  defaultLeadScoreRules: {
    noWebsite: 30,
    brokenWebsite: 25,
    activeInstagram: 15,
    highReviewCount: 10, // reviewCount >= minReviewsThreshold (e.g., 50)
    highReviewThreshold: 50,
    strongGoogleRating: 10, // rating >= minRatingThreshold (e.g., 4.5)
    strongRatingThreshold: 4.5,
    noEnquiryCta: 10,
    noPricingOrMembership: 5,
    noWhatsAppCta: 5,
    strongExistingWebsite: -30,
    modernDigitalPresence: -25,
    thresholdHot: 80,
    thresholdWarm: 60
  },
  defaultIndustries: [
    'Gym',
    'Real Estate',
    'Restaurant',
    'Cafe',
    'Clinic',
    'Salon',
    'School',
    'Coaching Institute',
    'Hotel',
    'Local Services',
    'Retail',
    'Professional Services',
    'Other'
  ],
  defaultLocations: [
    'Greater Noida',
    'Noida',
    'Delhi NCR',
    'Gurugram',
    'Bengaluru',
    'Mumbai',
    'Pune',
    'Hyderabad',
    'Ahmedabad',
    'Chandigarh'
  ],
  exportPreferences: {
    includePdcBranding: true,
    fileFormat: 'xlsx',
    dateFormat: 'YYYY-MM-DD'
  }
};
