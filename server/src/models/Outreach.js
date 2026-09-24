const mongoose = require('mongoose');

const outreachSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true
  },
  channel: {
    type: String,
    enum: ['WhatsApp', 'Instagram', 'Email', 'Phone', 'Other'],
    required: true,
    default: 'WhatsApp'
  },
  message: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  response: {
    type: String,
    default: 'Awaiting Response'
  },
  followUpDate: {
    type: Date
  },
  followUpNumber: {
    type: Number,
    default: 1
  },
  callDate: {
    type: Date
  },
  proposalDetails: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Sent', 'Replied', 'Call Scheduled', 'Proposal Sent', 'Won', 'Lost'],
    default: 'Sent'
  },
  notes: {
    type: String,
    default: ''
  },
  handledBy: {
    type: String,
    default: 'PDC Agent'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Outreach', outreachSchema);
