const express = require('express');
const router = express.Router();
const { auditSingleUrl } = require('../controllers/auditController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', auditSingleUrl);

module.exports = router;
