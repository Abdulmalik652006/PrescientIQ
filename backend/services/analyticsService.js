const Operation = require('../models/Operation');
const Team = require('../models/Team');
const mlService = require('./mlService');

const buildFilter = ({ startDate, endDate, department, region, status }) => {
  const filter = {};
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (department && department !== 'all') filter.department = department;
  if (region && region !== 'all') filter.region = region;
  if (status && status !== 'all') filter.status = status;
  return filter;
};

const getTrends = async (filters) => {
  const filter = buildFilter(filters);
  const ops = await Operation.find(filter).sort({ date: 1 }).lean();

  return ops.map((o) => ({
    date: o.date,
    performance: o.performance,
    productivity: Math.round((o.performance + o.resourceUtilization) / 2),
    efficiency: Math.round((o.performance * 0.6 + (100 - o.workload) * 0.4)),
    revenue: o.revenue,
    resourceUtilization: o.resourceUtilization,
    workload: o.workload,
    demand: o.demand,
  }));
};

const getRiskDistribution = async () => {
  const teams = await Team.find().lean();
  const distribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  teams.forEach((t) => {
    distribution[t.riskLevel] = (distribution[t.riskLevel] || 0) + 1;
  });
  return distribution;
};

/**
 * Calls the ML anomaly detection endpoint against the most recent operational window
 * and returns any flagged anomalies in human-readable form.
 */
const runAnomalyDetection = async (filters) => {
  const filter = buildFilter(filters);
  const ops = await Operation.find(filter).sort({ date: -1 }).limit(180).lean();
  if (!ops.length) return [];

  const byDept = {};
  ops.forEach((o) => {
    if (!byDept[o.department]) byDept[o.department] = [];
    byDept[o.department].push(o);
  });

  const anomalies = [];
  for (const [dept, deptOps] of Object.entries(byDept)) {
    const workloads = deptOps.map((o) => o.workload);
    const result = await mlService.detectAnomaly({ department: dept, values: workloads, metric: 'workload' });
    if (result.ok && result.data.is_anomaly) {
      const avg = workloads.reduce((a, b) => a + b, 0) / workloads.length;
      const latest = workloads[0];
      const pctAbove = avg > 0 ? Math.round(((latest - avg) / avg) * 100) : 0;
      anomalies.push({
        department: dept,
        metric: 'workload',
        anomalyScore: result.data.anomaly_score,
        explanation:
          result.data.explanation ||
          `${dept} workload is ${pctAbove}% above its historical average.`,
      });
    }
  }
  return anomalies;
};

/**
 * Deterministic, data-driven AI Analytics Summary (no random text — pulled from actual aggregates).
 */
const generateSummary = async (filters) => {
  const trends = await getTrends(filters);
  if (!trends.length) {
    return { headline: 'No data available for the selected filters.', points: [] };
  }

  const first = trends[0];
  const last = trends[trends.length - 1];
  const perfChange = first.performance ? Math.round(((last.performance - first.performance) / first.performance) * 1000) / 10 : 0;

  const teams = await Team.find().sort({ performance: -1 }).lean();
  const topTeam = teams[0];

  const highUtilOps = trends.filter((t) => t.resourceUtilization > 85);
  const highUtilRiskCorrelation = highUtilOps.length
    ? Math.round((highUtilOps.filter((t) => t.workload > 80).length / highUtilOps.length) * 100)
    : 0;

  const points = [
    `Performance ${perfChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(perfChange)}% over the selected period.`,
    topTeam ? `${topTeam.name} is currently the highest-performing team at ${topTeam.performance}%.` : null,
    highUtilOps.length
      ? `Resource utilization above 85% is associated with elevated workload in ${highUtilRiskCorrelation}% of observed cases.`
      : null,
  ].filter(Boolean);

  return { headline: points[0] || 'Analytics summary generated.', points };
};

module.exports = { getTrends, getRiskDistribution, runAnomalyDetection, generateSummary, buildFilter };
