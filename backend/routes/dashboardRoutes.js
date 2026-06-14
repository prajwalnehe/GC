const express = require('express');
const {
  getDashboardStats, getMonthlyLeads, getLeadSourceDistribution, getConversionRate, getRecentLeads,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/monthly-leads', getMonthlyLeads);
router.get('/lead-sources', getLeadSourceDistribution);
router.get('/conversion-rate', getConversionRate);
router.get('/recent-leads', getRecentLeads);

module.exports = router;
