const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['INFO', 'WARN', 'ERROR', 'SUCCESS'],
    default: 'INFO',
    index: true
  },
  category: {
    type: String,
    enum: [
      'CAMPAIGN',
      'DISCOVERY',
      'WEBSITE_AUDIT',
      'AI_PITCH',
      'DUPLICATE_CHECK',
      'EXPORT',
      'AUTH',
      'SYSTEM'
    ],
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Log', logSchema);
