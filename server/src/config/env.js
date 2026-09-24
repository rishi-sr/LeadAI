const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pdc_lead_intelligence',
  jwtSecret: process.env.JWT_SECRET || 'pdc_super_secret_jwt_key_2026_pixie_creatives_lead_intel',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  aiProvider: process.env.AI_PROVIDER || 'rule-engine',
  aiApiKey: process.env.AI_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};
