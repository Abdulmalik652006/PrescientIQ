const express = require('express');
const {
  generateForecast,
  listForecasts,
  getForecast,
  getAccuracy,
} = require('../controllers/forecastController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/generate', authorize('Admin', 'Manager', 'Analyst'), generateForecast);
router.get('/accuracy', getAccuracy);
router.get('/', listForecasts);
router.get('/:id', getForecast);

module.exports = router;
