const mongoose = require('mongoose');
const { defaultLeadScoreRules, defaultIndustries, defaultLocations, exportPreferences } = require('../config/defaultSettings');

const settingsSchema = new mongoose.Schema({
  googleApiKey: {
    type: String,
    default: ''
  },
  aiProvider: {
    type: String,
    enum: ['rule-engine', 'openai', 'gemini', 'anthropic', 'custom'],
    default: 'rule-engine'
  },
  aiApiKey: {
    type: String,
    default: ''
  },
  aiModel: {
    type: String,
    default: 'gpt-4o-mini'
  },
  aiCustomEndpoint: {
    type: String,
    default: ''
  },
  leadScoreRules: {
    type: Object,
    default: defaultLeadScoreRules
  },
  defaultMinRating: {
    type: Number,
    default: 4.0
  },
  defaultMinReviews: {
    type: Number,
    default: 20
  },
  industries: {
    type: [String],
    default: defaultIndustries
  },
  locations: {
    type: [String],
    default: defaultLocations
  },
  exportPreferences: {
    type: Object,
    default: exportPreferences
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
