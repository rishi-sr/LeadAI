const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  updateLead,
  addNote,
  analyzeLead,
  generateLeadPitch,
  bulkUpdateStage,
  deleteLead,
  exportLeads
} = require('../controllers/leadController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/export', exportLeads);
router.post('/bulk-stage', bulkUpdateStage);

router.route('/')
  .get(getLeads);

router.route('/:id')
  .get(getLeadById)
  .patch(updateLead)
  .delete(authorize('admin'), deleteLead);

router.post('/:id/notes', addNote);
router.post('/:id/analyze', analyzeLead);
router.post('/:id/generate-pitch', generateLeadPitch);

module.exports = router;
