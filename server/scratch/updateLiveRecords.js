const mongoose = require('mongoose');
const Lead = require('../src/models/Lead');
const { auditWebsite } = require('../src/services/websiteAuditService');
const { evaluateDigitalPresence } = require('../src/services/digitalGapService');
const { calculateLeadScore } = require('../src/services/scoringService');
const { generatePitch } = require('../src/services/aiService');

async function updateRecords() {
  await mongoose.connect('mongodb://127.0.0.1:27017/pdc_lead_intelligence');
  console.log('Connected to MongoDB');

  // 1. UPDATE BLACK VIGOR GYM
  const bvg = await Lead.findOne({ businessName: /Black Vigor Gym/i });
  if (bvg) {
    console.log('Found Black Vigor Gym, auditing https://blackvigor.com ...');
    const auditRes = await auditWebsite('https://blackvigor.com');
    bvg.website = 'https://blackvigor.com';
    bvg.websiteStatus = auditRes.status;
    bvg.websiteConfidence = 'HIGH';
    bvg.websiteSource = 'VERIFIED_OFFICIAL';
    bvg.websiteAudit = auditRes.audit;
    bvg.phone = '+91 83739 21215';
    bvg.email = 'info@blackvigor.com';
    bvg.address = 'Galaxy Plaza, Lower Basement (-2), Gaur City 1, Greater Noida West, UP 201009';
    bvg.instagramUsername = 'blackvigornoidaextn';
    bvg.instagramUrl = 'https://www.instagram.com/blackvigornoidaextn/';
    bvg.instagramFollowers = 14800;
    bvg.instagramStatus = 'ACTIVE';

    const gaps = evaluateDigitalPresence(bvg);
    Object.assign(bvg, gaps);

    const scoreData = await calculateLeadScore(bvg);
    bvg.score = scoreData.score;
    bvg.scoreClassification = scoreData.scoreClassification;
    bvg.scoreBreakdown = scoreData.scoreBreakdown;

    const pitchData = await generatePitch(bvg);
    bvg.pitch = pitchData.pitch;
    bvg.whatsappMessage = pitchData.whatsappMessage;
    bvg.instagramMessage = pitchData.instagramMessage;
    bvg.emailMessage = pitchData.emailMessage;

    bvg.timeline.push({
      action: 'Verified Official Website Added & Audited',
      details: `Website https://blackvigor.com verified. New PDC Score: ${bvg.score}/100 (${bvg.scoreClassification})`,
      timestamp: new Date()
    });

    await bvg.save();
    console.log('Black Vigor Gym updated successfully! Score:', bvg.score, bvg.scoreClassification);
  }

  // 2. UPDATE FITBEE FITNESS
  const fitbee = await Lead.findOne({ businessName: /Fitbee/i });
  if (fitbee) {
    console.log('Found Fitbee Fitness Club, updating...');
    fitbee.website = 'http://fitbeefitness.com';
    fitbee.phone = '+91 72919 20010';
    fitbee.instagramUsername = 'fitbeefitnessclub';
    fitbee.instagramUrl = 'https://www.instagram.com/fitbeefitnessclub/';
    fitbee.instagramFollowers = 6200;
    fitbee.instagramStatus = 'ACTIVE';
    fitbee.address = '8th Floor, Tradex Tower-II, Alpha 1 Commercial Belt, Greater Noida, UP 201310';
    const auditRes = await auditWebsite('http://fitbeefitness.com');
    fitbee.websiteStatus = auditRes.status;
    fitbee.websiteAudit = auditRes.audit;

    const gaps = evaluateDigitalPresence(fitbee);
    Object.assign(fitbee, gaps);

    const scoreData = await calculateLeadScore(fitbee);
    fitbee.score = scoreData.score;
    fitbee.scoreClassification = scoreData.scoreClassification;
    fitbee.scoreBreakdown = scoreData.scoreBreakdown;

    await fitbee.save();
    console.log('Fitbee updated successfully! Score:', fitbee.score);
  }

  process.exit(0);
}

updateRecords().catch(err => {
  console.error(err);
  process.exit(1);
});
