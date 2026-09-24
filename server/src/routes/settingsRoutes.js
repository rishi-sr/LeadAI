const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  triggerSeed
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.route('/')
  .get(getSettings)
  .patch(authorize('admin'), updateSettings);

router.post('/seed', authorize('admin'), triggerSeed);

module.exports = router;
