const express = require('express');
const router = express.Router();
const {
  getOutreaches,
  createOutreach,
  updateOutreach
} = require('../controllers/outreachController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getOutreaches)
  .post(createOutreach);

router.route('/:id')
  .patch(updateOutreach);

module.exports = router;
