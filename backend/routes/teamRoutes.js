const express = require('express');
const { listTeams, getComparison, getTeam, predictTeam } = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/comparison', getComparison);
router.get('/', listTeams);
router.get('/:id', getTeam);
router.post('/:id/predict', authorize('Admin', 'Manager', 'Analyst'), predictTeam);

module.exports = router;
