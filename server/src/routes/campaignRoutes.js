const express = require('express');
const router = express.Router();
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  rerunCampaign
} = require('../controllers/campaignController');
const { protect } = require('../middleware/auth');
const { generationLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.route('/')
  .post(generationLimiter, createCampaign)
  .get(getCampaigns);

router.route('/:id')
  .get(getCampaignById);

router.route('/:id/rerun')
  .post(rerunCampaign);

module.exports = router;
