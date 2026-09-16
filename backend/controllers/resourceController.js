const Resource = require('../models/Resource');
const mlService = require('../services/mlService');

// @route GET /api/resources/summary
const getSummary = async (req, res, next) => {
  try {
    const [total, available, allocated, overloaded, underutilized] = await Promise.all([
      Resource.countDocuments(),
      Resource.countDocuments({ availability: 'Available' }),
      Resource.countDocuments({ availability: 'Allocated' }),
      Resource.countDocuments({ status: 'Critical' }),
      Resource.countDocuments({ status: 'Underutilized' }),
    ]);
    res.json({ success: true, summary: { total, available, allocated, overloaded, underutilized } });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/resources?department=&status=&team=&page=&limit=
const listResources = async (req, res, next) => {
  try {
    const { department, status, team, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (team) filter.team = team;

    const [items, total] = await Promise.all([
      Resource.find(filter)
        .populate('team', 'name')
        .sort({ utilization: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Resource.countDocuments(filter),
    ]);

    res.json({ success: true, items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/resources/:id -> detail with historical + predicted workload
const getResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('team').lean();
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    const mlResult = await mlService.predictResources({
      resource_utilization: resource.utilization,
      workload: resource.currentLoad,
      capacity: resource.capacity,
      horizon: 30,
    });

    const predicted = mlResult.ok
      ? {
          predictedUtilization: mlResult.data.expected_utilization,
          capacityGap: mlResult.data.capacity_gap,
          recommendedAction:
            mlResult.data.capacity_gap > 0
              ? `Increase capacity by ~${Math.round(mlResult.data.capacity_gap)}% to avoid overload`
              : 'Current capacity is sufficient for the projected workload',
        }
      : { predictedUtilization: null, capacityGap: null, recommendedAction: 'Prediction unavailable — ML service unreachable' };

    res.json({ success: true, resource, predicted });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/resources/:id/reallocate  body: { currentLoad, team }
const reallocateResource = async (req, res, next) => {
  try {
    const { currentLoad, team } = req.body;
    const update = {};
    if (currentLoad !== undefined) update.currentLoad = currentLoad;
    if (team !== undefined) update.team = team;
    if (currentLoad !== undefined) update.availability = 'Allocated';

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    Object.assign(resource, update);
    await resource.save(); // triggers pre-save utilization/status recompute

    res.json({ success: true, resource });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, listResources, getResource, reallocateResource };
