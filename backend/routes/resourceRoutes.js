const express = require('express');
const {
  getSummary,
  listResources,
  getResource,
  reallocateResource,
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, rules } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/', rules.pagination, validate, listResources);
router.get('/:id', rules.mongoIdParam, validate, getResource);
router.put('/:id/reallocate', authorize('Admin', 'Manager'), rules.mongoIdParam, validate, reallocateResource);

module.exports = router;
