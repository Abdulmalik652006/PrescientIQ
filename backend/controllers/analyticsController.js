const analyticsService = require('../services/analyticsService');
const Operation = require('../models/Operation');

// @route GET /api/analytics/trends
const getTrends = async (req, res, next) => {
  try {
    const trends = await analyticsService.getTrends(req.query);
    res.json({ success: true, trends });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/analytics/risk-distribution
const getRiskDistribution = async (req, res, next) => {
  try {
    const distribution = await analyticsService.getRiskDistribution();
    res.json({ success: true, distribution });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/analytics/anomalies
const getAnomalies = async (req, res, next) => {
  try {
    const anomalies = await analyticsService.runAnomalyDetection(req.query);
    res.json({ success: true, anomalies });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/analytics/summary
const getSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.generateSummary(req.query);
    res.json({ success: true, summary });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/analytics/filters -> distinct filter options for the UI
const getFilterOptions = async (req, res, next) => {
  try {
    const [departments, regions] = await Promise.all([
      Operation.distinct('department'),
      Operation.distinct('region'),
    ]);
    res.json({
      success: true,
      options: {
        departments,
        regions,
        statuses: ['Normal', 'Elevated', 'Anomalous'],
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTrends, getRiskDistribution, getAnomalies, getSummary, getFilterOptions };
