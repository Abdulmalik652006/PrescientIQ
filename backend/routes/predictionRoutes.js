const express = require('express');
const {
  generatePrediction,
  listPredictions,
  getPrediction,
  recordActual,
} = require('../controllers/predictionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, rules } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.post('/generate', authorize('Admin', 'Manager', 'Analyst'), rules.generatePrediction, validate, generatePrediction);
router.get('/', rules.pagination, validate, listPredictions);
router.get('/:id', rules.mongoIdParam, validate, getPrediction);
router.put('/:id/actual', authorize('Admin', 'Manager', 'Analyst'), rules.mongoIdParam, validate, recordActual);

module.exports = router;
