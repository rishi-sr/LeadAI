const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  targetCount: {
    type: Number,
    default: 50
  },
  minimumRating: {
    type: Number,
    default: 4.0
  },
  minimumReviews: {
    type: Number,
    default: 20
  },
  status: {
    type: String,
    enum: ['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL'],
    default: 'QUEUED',
    index: true
  },
  progress: {
    stage: {
      type: String,
      default: 'Initializing'
    },
    stepIndex: {
      type: Number,
      default: 0
    },
    totalSteps: {
      type: Number,
      default: 7
    },
    current: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    message: {
      type: String,
      default: 'Queued for processing'
    }
  },
  stats: {
    totalDiscovered: { type: Number, default: 0 },
    websitesFound: { type: Number, default: 0 },
    brokenWebsites: { type: Number, default: 0 },
    noWebsites: { type: Number, default: 0 },
    qualifiedLeads: { type: Number, default: 0 },
    hotCount: { type: Number, default: 0 },
    warmCount: { type: Number, default: 0 },
    lowCount: { type: Number, default: 0 }
  },
  error: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
