const Report = require('../models/Report');
const Operation = require('../models/Operation');
const Alert = require('../models/Alert');
const Resource = require('../models/Resource');
const Team = require('../models/Team');
const Prediction = require('../models/Prediction');
const Recommendation = require('../models/Recommendation');
const analyticsService = require('../services/analyticsService');

const PERIOD_TO_DAYS = { Daily: 1, Weekly: 7, Monthly: 30, Quarterly: 90 };

// @route POST /api/reports/generate  body: { period, startDate?, endDate? }
const generateReport = async (req, res, next) => {
  try {
    const { period, startDate, endDate } = req.body;

    let start;
    let end = endDate ? new Date(endDate) : new Date();
    if (period === 'Custom') {
      if (!startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Custom reports require startDate and endDate' });
      }
      start = new Date(startDate);
    } else {
      start = new Date(end);
      start.setDate(end.getDate() - (PERIOD_TO_DAYS[period] || 7));
    }

    const ops = await Operation.find({ date: { $gte: start, $lte: end } }).lean();
    const avg = (key) => (ops.length ? Math.round((ops.reduce((s, o) => s + o[key], 0) / ops.length) * 10) / 10 : 0);

    const kpiSummary = {
      totalOperations: ops.length,
      avgPerformance: avg('performance'),
      avgUtilization: avg('resourceUtilization'),
      totalRevenue: ops.reduce((s, o) => s + o.revenue, 0),
    };

    const analyticsSummary = await analyticsService.generateSummary({ startDate: start, endDate: end });

    const predictions = await Prediction.find({ createdAt: { $gte: start, $lte: end } }).lean();
    const predictionsSummary = {
      totalGenerated: predictions.length,
      avgConfidence: predictions.length
        ? Math.round((predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length) * 10) / 10
        : null,
    };

    const alerts = await Alert.find({ createdAt: { $gte: start, $lte: end } }).lean();
    const risksSummary = {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'Critical').length,
      high: alerts.filter((a) => a.severity === 'High').length,
      resolved: alerts.filter((a) => a.status === 'Resolved').length,
    };

    const resourceSummaryCounts = await Resource.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const resourcesSummary = {};
    resourceSummaryCounts.forEach((r) => {
      resourcesSummary[r._id] = r.count;
    });

    const teams = await Team.find().select('name performance riskLevel').lean();
    const teamsSummary = {
      total: teams.length,
      avgPerformance: teams.length
        ? Math.round((teams.reduce((s, t) => s + t.performance, 0) / teams.length) * 10) / 10
        : null,
      atRisk: teams.filter((t) => t.riskLevel === 'High' || t.riskLevel === 'Critical').length,
    };

    const recommendations = await Recommendation.find({ createdAt: { $gte: start, $lte: end } })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const report = await Report.create({
      title: `${period} Management Report`,
      period,
      dateRange: { start, end },
      kpiSummary,
      analyticsSummary,
      predictionsSummary,
      risksSummary,
      resourcesSummary,
      teamsSummary,
      recommendations: recommendations.map((r) => r._id),
      generatedBy: req.user._id,
    });

    res.status(201).json({ success: true, report: { ...report.toObject(), recommendations } });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/reports
const listReports = async (req, res, next) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/reports/:id
const getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate('recommendations').lean();
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/reports/download
const downloadReport = async (req, res, next) => {
  try {
    const ops = await Operation.find().lean();
    const alerts = await Alert.find().lean();
    const teams = await Team.find().lean();

    const totalOps = ops.length;
    const avgPerf = ops.length ? Math.round(ops.reduce((s, o) => s + (o.performance || 0), 0) / ops.length) : 85;
    const avgUtil = ops.length ? Math.round(ops.reduce((s, o) => s + (o.resourceUtilization || 0), 0) / ops.length) : 78;

    const reportContent = `PREDICTIVE MANAGEMENT SYSTEM - EXECUTIVE REPORT
Generated On: ${new Date().toISOString()}

=== KEY PERFORMANCE INDICATORS ===
Total Operations: ${totalOps}
Average Performance: ${avgPerf}%
Average Resource Utilization: ${avgUtil}%
Active Risk Alerts: ${alerts.filter(a => a.status !== 'Resolved').length}

=== RISK ASSESSMENT ===
Critical Alerts: ${alerts.filter(a => a.severity === 'Critical').length}
High Risk Alerts: ${alerts.filter(a => a.severity === 'High').length}
Medium Risk Alerts: ${alerts.filter(a => a.severity === 'Medium').length}

=== TEAM STATUS ===
${teams.map(t => `- ${t.name}: Performance ${t.performance}%, Utilization ${t.utilization}%, Risk ${t.riskLevel}`).join('\n')}

=== RECOMMENDATIONS ===
1. Reallocate capacity to teams exceeding 85% utilization.
2. Address open critical risk alerts immediately.
3. Monitor performance forecast trends for proactive adjustments.
`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=predictive-management-report-${new Date().toISOString().slice(0, 10)}.txt`);
    res.send(reportContent);
  } catch (err) {
    next(err);
  }
};

module.exports = { generateReport, listReports, getReport, downloadReport };
