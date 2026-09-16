const express = require('express');
const {
  getTrends,
  getRiskDistribution,
  getAnomalies,
  getSummary,
  getFilterOptions,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/trends', getTrends);
router.get('/risk-distribution', getRiskDistribution);
router.get('/anomalies', getAnomalies);
router.get('/summary', getSummary);
router.get('/filters', getFilterOptions);

module.exports = router;
