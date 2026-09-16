const Recommendation = require('../models/Recommendation');
const Team = require('../models/Team');

/**
 * Deterministic recommendation logic, grounded directly in the prediction/risk numbers
 * (never randomly generated, per project requirements).
 */
const generateFromPrediction = async ({ prediction, riskOutcome, department }) => {
  const recommendations = [];

  let team = null;
  if (prediction.entityId && prediction.entityType === 'Team') {
    team = await Team.findById(prediction.entityId);
  } else if (department) {
    team = await Team.findOne({ department });
  }

  const targetName = team ? team.name : department || 'the affected department';

  // Rule 1: demand/revenue growth beyond 15% -> recommend resource allocation
  if (['demand', 'revenue'].includes(prediction.type) && (prediction.growthPercentage || 0) >= 15) {
    const extra = Math.max(1, Math.round((prediction.growthPercentage || 0) / 10));
    const rec = await Recommendation.create({
      title: `Scale resources for ${targetName}`,
      description: `Projected ${prediction.type} growth of ${prediction.growthPercentage}% over ${prediction.horizon} days will outpace current capacity if unaddressed.`,
      basedOnPrediction: prediction._id,
      relatedAlert: riskOutcome.alert ? riskOutcome.alert._id : undefined,
      relatedTeam: team ? team._id : undefined,
      action: `Allocate ${extra} additional resource(s) to ${targetName}`,
      expectedImpact: `Risk reduction ≈ ${Math.min(35, Math.round((prediction.growthPercentage || 0) * 1.2))}%`,
      expectedImpactValue: -Math.min(35, Math.round((prediction.growthPercentage || 0) * 1.2)),
      priority: (prediction.growthPercentage || 0) >= 25 ? 'Critical' : 'High',
    });
    recommendations.push(rec);
  }

  // Rule 2: risk level High/Critical -> recommend risk mitigation
  if (riskOutcome.riskLevel === 'High' || riskOutcome.riskLevel === 'Critical') {
    const rec = await Recommendation.create({
      title: `Mitigate elevated risk in ${targetName}`,
      description: `Risk model flagged ${riskOutcome.riskLevel.toLowerCase()} risk (${riskOutcome.riskProbability}% probability) driven by current workload and utilization levels.`,
      basedOnPrediction: prediction._id,
      relatedAlert: riskOutcome.alert ? riskOutcome.alert._id : undefined,
      relatedTeam: team ? team._id : undefined,
      action: `Redistribute workload and monitor ${targetName} daily until risk drops below Medium`,
      expectedImpact: `Risk reduction ≈ ${Math.round((riskOutcome.riskProbability || 60) * 0.3)}%`,
      expectedImpactValue: -Math.round((riskOutcome.riskProbability || 60) * 0.3),
      priority: riskOutcome.riskLevel,
    });
    recommendations.push(rec);
  }

  // Rule 3: resource prediction type -> recommend capacity gap closure
  if (prediction.type === 'resources' && (prediction.growthPercentage || 0) > 0) {
    const rec = await Recommendation.create({
      title: `Close capacity gap for ${targetName}`,
      description: `Predicted capacity gap of ${prediction.growthPercentage}% between required and available resources over ${prediction.horizon} days.`,
      basedOnPrediction: prediction._id,
      relatedAlert: riskOutcome.alert ? riskOutcome.alert._id : undefined,
      relatedTeam: team ? team._id : undefined,
      action: `Onboard or reassign resources to close the ${prediction.growthPercentage}% capacity gap`,
      expectedImpact: `Utilization normalization within ${prediction.horizon} days`,
      priority: 'High',
    });
    recommendations.push(rec);
  }

  return recommendations;
};

module.exports = { generateFromPrediction };
