const express = require('express');
const {
  getLeads, getLeadById, createLead, updateLead, deleteLead, markClientFollowup, addNote, exportLeads,
} = require('../controllers/leadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/export', exportLeads);
router.route('/').get(getLeads).post(createLead);
router.route('/:id').get(getLeadById).put(updateLead).delete(deleteLead);
router.post('/:id/notes', addNote);
router.post('/:id/client-followup', markClientFollowup);

module.exports = router;
