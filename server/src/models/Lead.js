const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  address: {
    type: String,
    default: 'NOT FOUND'
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'India'
  },
  phone: {
    type: String,
    default: 'NOT FOUND',
    index: true
  },
  email: {
    type: String,
    default: 'NOT FOUND'
  },
  contactPerson: {
    type: String,
    default: 'NOT FOUND'
  },
  googleMapsUrl: {
    type: String,
    default: ''
  },
  placeId: {
    type: String,
    sparse: true,
    index: true
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  openingHours: {
    type: [String],
    default: []
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  website: {
    type: String,
    default: ''
  },
  websiteStatus: {
    type: String,
    enum: ['NO WEBSITE', 'BROKEN', 'BASIC', 'OUTDATED', 'GOOD', 'STRONG', 'UNKNOWN'],
    default: 'UNKNOWN',
    index: true
  },
  websiteConfidence: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW', 'NONE'],
    default: 'NONE'
  },
  websiteSource: {
    type: String,
    enum: ['GOOGLE_PLACES', 'SOCIAL_PROFILE', 'WEB_SEARCH', 'MANUAL', 'AUTOMATED_DOMAIN_RESOLUTION', 'VERIFIED_OFFICIAL', 'USER_SPECIFIED', 'NONE'],
    default: 'NONE'
  },
  instagramUsername: {
    type: String,
    default: 'NOT FOUND'
  },
  instagramUrl: {
    type: String,
    default: ''
  },
  instagramFollowers: {
    type: Number,
    default: 0
  },
  instagramStatus: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'NOT FOUND', 'NOT VERIFIED'],
    default: 'NOT FOUND'
  },
  instagramBio: {
    type: String,
    default: ''
  },
  websiteAudit: {
    checked: { type: Boolean, default: false },
    checkedAt: { type: Date },
    statusCode: { type: Number },
    responseTimeMs: { type: Number },
    https: { type: Boolean, default: false },
    mobileResponsive: { type: Boolean, default: false },
    pageTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    contactInfoDetected: { type: Boolean, default: false },
    phoneDetected: { type: Boolean, default: false },
    whatsappDetected: { type: Boolean, default: false },
    addressDetected: { type: Boolean, default: false },
    googleMapsDetected: { type: Boolean, default: false },
    openingHoursDetected: { type: Boolean, default: false },
    pricingDetected: { type: Boolean, default: false },
    membershipPlansDetected: { type: Boolean, default: false },
    ctaDetected: { type: Boolean, default: false },
    leadFormDetected: { type: Boolean, default: false },
    bookingDetected: { type: Boolean, default: false },
    testimonialsDetected: { type: Boolean, default: false },
    galleryDetected: { type: Boolean, default: false },
    servicesDetected: { type: Boolean, default: false },
    socialLinksDetected: { type: Boolean, default: false },
    brokenLinksDetected: { type: Boolean, default: false },
    notes: { type: String, default: '' }
  },
  digitalStrengths: {
    type: [String],
    default: []
  },
  digitalGaps: {
    type: [String],
    default: []
  },
  opportunities: {
    type: [String],
    default: []
  },
  recommendedServices: {
    type: [String],
    default: []
  },
  reasonToContact: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: 0,
    index: true
  },
  scoreClassification: {
    type: String,
    enum: ['HOT', 'WARM', 'LOW'],
    default: 'LOW',
    index: true
  },
  scoreBreakdown: [{
    rule: String,
    points: Number,
    reason: String
  }],
  stage: {
    type: String,
    enum: [
      'NEW',
      'RESEARCHED',
      'HOT',
      'WARM',
      'CONTACTED',
      'REPLIED',
      'CALL SCHEDULED',
      'PROPOSAL SENT',
      'NEGOTIATION',
      'WON',
      'LOST',
      'NOT INTERESTED'
    ],
    default: 'NEW',
    index: true
  },
  pitch: {
    problem: { type: String, default: '' },
    observation: { type: String, default: '' },
    opportunity: { type: String, default: '' },
    recommendedService: { type: String, default: '' },
    shortPitch: { type: String, default: '' }
  },
  whatsappMessage: {
    type: String,
    default: ''
  },
  instagramMessage: {
    type: String,
    default: ''
  },
  emailMessage: {
    type: String,
    default: ''
  },
  competitor: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: 'Google Places'
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    index: true
  },
  notes: [{
    text: { type: String, required: true },
    author: { type: String, default: 'PDC Team' },
    createdAt: { type: Date, default: Date.now }
  }],
  timeline: [{
    action: { type: String, required: true },
    details: { type: String, default: '' },
    user: { type: String, default: 'System' },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Composite index for deduplication search
leadSchema.index({ businessName: 1, location: 1, phone: 1 });

module.exports = mongoose.model('Lead', leadSchema);
