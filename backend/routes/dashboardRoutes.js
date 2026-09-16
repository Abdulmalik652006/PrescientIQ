const express = require('express');
const {
  getKpis,
  getPerformanceChart,
  getAiPredictionsSummary,
  getRiskMonitor,
  getResourceUtilizationSummary,
  getAiInsight,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/kpis', getKpis);
router.get('/performance-chart', getPerformanceChart);
router.get('/ai-predictions', getAiPredictionsSummary);
router.get('/risk-monitor', getRiskMonitor);
router.get('/resource-utilization', getResourceUtilizationSummary);
router.get('/ai-insight', getAiInsight);

module.exports = router;
