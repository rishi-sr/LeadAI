const mongoose = require('mongoose');
const Lead = require('../src/models/Lead');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/pdc_lead_intelligence');
  const bvg = await Lead.findOne({ businessName: /Black Vigor/i });
  if (bvg) {
    bvg.phone = '+91 83739 21215';
    bvg.email = 'info@blackvigor.com';
    bvg.address = 'Galaxy Plaza, Lower Basement (-2), Gaur City 1, Greater Noida West, UP 201009';
    await bvg.save();
    console.log('Saved Black Vigor Gym:', bvg.businessName, bvg.phone, bvg.website, bvg.instagramUrl);
  }
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
