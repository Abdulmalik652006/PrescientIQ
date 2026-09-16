const Team = require('../models/Team');
const mlService = require('../services/mlService');
const Recommendation = require('../models/Recommendation');

// @route GET /api/teams
const listTeams = async (req, res, next) => {
  try {
    const { department, riskLevel, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (riskLevel) filter.riskLevel = riskLevel;

    const [items, total] = await Promise.all([
      Team.find(filter)
        .sort({ performance: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Team.countDocuments(filter),
    ]);

    res.json({ success: true, items, total });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/teams/comparison -> data shaped for multi-series comparison charts
const getComparison = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .select('name performance productivity efficiency workload utilization riskLevel')
      .lean();
    res.json({ success: true, teams });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/teams/:id
const getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id).lean();
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, team });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/teams/:id/predict -> team-specific performance prediction + recommendation
const predictTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    const mlResult = await mlService.predictTeamPerformance({
      historical_performance: team.performance,
      workload: team.workload,
      utilization: team.utilization,
      task_completion: team.efficiency,
      resource_count: team.resourceCount,
      efficiency: team.efficiency,
      horizon: Number(req.body.horizon) || 30,
    });

    if (!mlResult.ok) {
      const err = new Error(mlResult.error);
      err.isAxiosError = true;
      throw err;
    }

    const { predicted_performance, risk_probability, recommended_resources } = mlResult.data;
    const expectedWorkloadChange = Math.round(((team.workload * 1.0) * (risk_probability / 100)) * 10) / 10;

    let recommendation = null;
    if (recommended_resources > 0) {
      recommendation = await Recommendation.create({
        title: `Add capacity to ${team.name}`,
        description: `Predicted performance decline to ${predicted_performance}% with risk probability ${risk_probability}%.`,
        relatedTeam: team._id,
        action: `Add ${recommended_resources} resource(s) to ${team.name}`,
        expectedImpact: `Stabilize performance and reduce risk probability`,
        priority: risk_probability >= 70 ? 'Critical' : 'High',
      });
    }

    res.json({
      success: true,
      teamPrediction: {
        team: team.name,
        currentPerformance: team.performance,
        predictedPerformance: predicted_performance,
        expectedWorkloadChange: `${expectedWorkloadChange >= 0 ? '+' : ''}${expectedWorkloadChange}%`,
        riskProbability: risk_probability,
        recommendedResources: recommended_resources,
      },
      recommendation,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listTeams, getComparison, getTeam, predictTeam };
