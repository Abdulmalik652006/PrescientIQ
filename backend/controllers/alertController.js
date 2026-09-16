const Alert = require('../models/Alert');

// @route GET /api/alerts/summary
const getSummary = async (req, res, next) => {
  try {
    const [critical, high, medium, resolved] = await Promise.all([
      Alert.countDocuments({ severity: 'Critical', status: { $ne: 'Resolved' } }),
      Alert.countDocuments({ severity: 'High', status: { $ne: 'Resolved' } }),
      Alert.countDocuments({ severity: 'Medium', status: { $ne: 'Resolved' } }),
      Alert.countDocuments({ status: 'Resolved' }),
    ]);
    res.json({ success: true, summary: { critical, high, medium, resolved } });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/alerts?severity=&status=&team=&page=&limit=
const listAlerts = async (req, res, next) => {
  try {
    const { severity, status, team, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (team) filter.team = team;

    const [items, total] = await Promise.all([
      Alert.find(filter)
        .populate('team', 'name department')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Alert.countDocuments(filter),
    ]);

    res.json({ success: true, items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/alerts/:id
const getAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('team')
      .populate('affectedResources')
      .populate('recommendations')
      .populate('predictionRef')
      .populate('assignedTo', 'name email role');
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/alerts/:id/assign
const assignAlert = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'Assigned', assignedTo: userId },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/alerts/:id/resolve
const resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'Resolved', resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/alerts/:id/escalate
const escalateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { status: 'Escalated' }, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, listAlerts, getAlert, assignAlert, resolveAlert, escalateAlert };
