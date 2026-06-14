const express = require('express');
const {
  getFollowUps, getFollowUpById, createFollowUp, updateFollowUp, deleteFollowUp,
} = require('../controllers/followUpController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.route('/').get(getFollowUps).post(createFollowUp);
router.route('/:id').get(getFollowUpById).put(updateFollowUp).delete(deleteFollowUp);

module.exports = router;
