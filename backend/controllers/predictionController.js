const predictionService = require('../services/predictionService');
const Prediction = require('../models/Prediction');

// @route POST /api/predictions/generate
// body: { type, horizon, department?, region?, entityId?, entityType? }
const generatePrediction = async (req, res, next) => {
  try {
    const { type, horizon, department, region, entityId, entityType } = req.body;

    const { prediction, riskOutcome, recommendations } = await predictionService.generatePrediction({
      type,
      horizon: Number(horizon),
      department,
      region,
      entityId,
      entityType,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      prediction,
      risk: riskOutcome,
      recommendations,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/predictions?type=&page=&limit=
const listPredictions = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const filter = type ? { type } : {};

    const [items, total] = await Promise.all([
      Prediction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('recommendations')
        .lean(),
      Prediction.countDocuments(filter),
    ]);

    res.json({ success: true, items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/predictions/:id
const getPrediction = async (req, res, next) => {
  try {
    const prediction = await Prediction.findById(req.params.id).populate('recommendations').lean();
    if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
    res.json({ success: true, prediction });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/predictions/:id/actual  (used to record the real outcome for accuracy tracking)
const recordActual = async (req, res, next) => {
  try {
    const { actualValue } = req.body;
    const prediction = await Prediction.findByIdAndUpdate(
      req.params.id,
      { actualValue, actualRecordedAt: new Date() },
      { new: true }
    );
    if (!prediction) return res.status(404).json({ success: false, message: 'Prediction not found' });
    res.json({ success: true, prediction });
  } catch (err) {
    next(err);
  }
};

module.exports = { generatePrediction, listPredictions, getPrediction, recordActual };
