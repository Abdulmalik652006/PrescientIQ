const express = require('express');
const { generateReport, listReports, getReport, downloadReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/generate', authorize('Admin', 'Manager', 'Analyst'), generateReport);
router.get('/generate', downloadReport);
router.get('/download', downloadReport);
router.get('/', listReports);
router.get('/:id', getReport);

module.exports = router;
