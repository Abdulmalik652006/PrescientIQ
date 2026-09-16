const mlService = require('./mlService');
const Alert = require('../models/Alert');
const Team = require('../models/Team');

const SEVERITY_BY_LEVEL = {
  Critical: 'Critical',
  High: 'High',
  Medium: 'Medium',
  Low: 'Low',
};

/**
 * Given a just-generated prediction, run/derive a risk assessment and create an Alert
 * if the resulting risk crosses a meaningful threshold. Returns { riskLevel, riskProbability, alert }.
 */
const assessAndCreateAlert = async ({ prediction, features, department, region, entityId }) => {
  let riskLevel = prediction.riskLevel;
  let riskProbability = prediction.riskScore;

  // If this prediction wasn't itself a risk prediction, run one now so every
  // generated prediction is risk-aware (per the demo flow: prediction -> risk -> alert).
  if (!riskLevel) {
    const riskResult = await mlService.predictRisk({
      resource_utilization: features.resource_utilization,
      workload: features.workload,
      performance: features.performance,
      absenteeism: features.absenteeism,
      historical_incidents: features.historical_incidents,
      demand_growth: prediction.growthPercentage ?? features.demand_growth,
      team_capacity: features.team_capacity,
    });

    if (riskResult.ok) {
      riskLevel = riskResult.data.risk_level;
      riskProbability = riskResult.data.risk_probability;
    }
  }

  let alert = null;

  if (riskLevel === 'High' || riskLevel === 'Critical') {
    let team = null;
    if (entityId) {
      team = await Team.findById(entityId);
    } else if (department) {
      team = await Team.findOne({ department });
    }

    const growthNote =
      prediction.growthPercentage != null
        ? ` (${prediction.type} projected to change by ${prediction.growthPercentage}% over ${prediction.horizon} days)`
        : '';

    alert = await Alert.create({
      severity: SEVERITY_BY_LEVEL[riskLevel] || 'Medium',
      title:
        prediction.type === 'resources'
          ? 'Resource Shortage'
          : prediction.type === 'demand'
            ? 'Demand Spike'
            : 'Operational Risk Detected',
      description: `Automated risk model flagged elevated risk for ${
        team ? team.name : department || 'the organization'
      }${growthNote}.`,
      probability: riskProbability ?? 75,
      impact: riskLevel === 'Critical' ? 'High' : 'Medium',
      status: 'Open',
      team: team ? team._id : undefined,
      predictionWindow: `Next ${prediction.horizon} days`,
      rootCause: prediction.explanation,
      predictionRef: prediction._id,
    });
  }

  return { riskLevel, riskProbability, alert };
};

module.exports = { assessAndCreateAlert };
