const Settings = require('../models/Settings');
const { seedDatabase } = require('../services/seedService');
const { defaultLeadScoreRules, defaultIndustries, defaultLocations, exportPreferences } = require('../config/defaultSettings');
const Log = require('../models/Log');

// @desc    Get current application settings
// @route   GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        leadScoreRules: defaultLeadScoreRules,
        industries: defaultIndustries,
        locations: defaultLocations,
        exportPreferences
      });
    }

    // Mask sensitive keys for client security
    const maskedSettings = settings.toObject();
    if (maskedSettings.googleApiKey) {
      maskedSettings.googleApiKeyMasked = `${maskedSettings.googleApiKey.slice(0, 4)}••••••••${maskedSettings.googleApiKey.slice(-4)}`;
      maskedSettings.googleApiKeyConfigured = true;
    } else {
      maskedSettings.googleApiKeyConfigured = false;
    }

    if (maskedSettings.aiApiKey) {
      maskedSettings.aiApiKeyMasked = `${maskedSettings.aiApiKey.slice(0, 3)}••••••••${maskedSettings.aiApiKey.slice(-3)}`;
      maskedSettings.aiApiKeyConfigured = true;
    } else {
      maskedSettings.aiApiKeyConfigured = false;
    }

    res.json({ success: true, settings: maskedSettings });
  } catch (err) {
    next(err);
  }
};

// @desc    Update system settings
// @route   PATCH /api/settings
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const {
      googleApiKey,
      aiProvider,
      aiApiKey,
      aiModel,
      leadScoreRules,
      defaultMinRating,
      defaultMinReviews,
      exportPreferences: expPrefs
    } = req.body;

    if (googleApiKey !== undefined && !googleApiKey.includes('••••')) settings.googleApiKey = googleApiKey.trim();
    if (aiProvider !== undefined) settings.aiProvider = aiProvider;
    if (aiApiKey !== undefined && !aiApiKey.includes('••••')) settings.aiApiKey = aiApiKey.trim();
    if (aiModel !== undefined) settings.aiModel = aiModel;
    if (leadScoreRules !== undefined) settings.leadScoreRules = { ...settings.leadScoreRules, ...leadScoreRules };
    if (defaultMinRating !== undefined) settings.defaultMinRating = Number(defaultMinRating);
    if (defaultMinReviews !== undefined) settings.defaultMinReviews = Number(defaultMinReviews);
    if (expPrefs !== undefined) settings.exportPreferences = { ...settings.exportPreferences, ...expPrefs };

    await settings.save();

    await Log.create({
      level: 'INFO',
      category: 'SYSTEM',
      message: 'System settings updated',
      userId: req.user?._id
    });

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Trigger 1-click test dataset seeding
// @route   POST /api/settings/seed
const triggerSeed = async (req, res, next) => {
  try {
    const result = await seedDatabase();
    res.json({ success: true, message: 'Database seed executed', result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  triggerSeed
};
