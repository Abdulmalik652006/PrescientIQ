const express = require('express');
const {
  getSummary,
  listAlerts,
  getAlert,
  assignAlert,
  resolveAlert,
  escalateAlert,
} = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, rules } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/', rules.pagination, validate, listAlerts);
router.get('/:id', rules.mongoIdParam, validate, getAlert);
router.put('/:id/assign', authorize('Admin', 'Manager'), rules.mongoIdParam, validate, assignAlert);
router.put('/:id/resolve', authorize('Admin', 'Manager', 'Analyst'), rules.mongoIdParam, validate, resolveAlert);
router.put('/:id/escalate', authorize('Admin', 'Manager'), rules.mongoIdParam, validate, escalateAlert);

module.exports = router;
