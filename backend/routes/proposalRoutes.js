const express = require('express');
const {
  getProposals, getProposalById, createProposal, updateProposal, deleteProposal,
} = require('../controllers/proposalController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);
router.route('/').get(getProposals).post(upload.single('pdf'), createProposal);
router.route('/:id').get(getProposalById).put(upload.single('pdf'), updateProposal).delete(deleteProposal);

module.exports = router;
