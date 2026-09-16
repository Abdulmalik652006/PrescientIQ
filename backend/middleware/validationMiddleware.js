const { validationResult, body, param, query } = require('express-validator');

// Runs after a chain of express-validator checks; short-circuits with 400 on failure
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const rules = {
  register: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['Admin', 'Manager', 'Analyst', 'Viewer']),
  ],
  login: [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  generatePrediction: [
    body('type')
      .isIn(['demand', 'revenue', 'resources', 'risk', 'team-performance', 'workload'])
      .withMessage('Invalid prediction type'),
    body('horizon').isInt({ min: 1, max: 365 }).withMessage('Horizon must be between 1 and 365 days'),
    body('department').optional().isString(),
    body('region').optional().isString(),
    body('entityId').optional().isMongoId(),
  ],
  mongoIdParam: [param('id').isMongoId().withMessage('Invalid id')],
  pagination: [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 200 }),
  ],
};

module.exports = { validate, rules };
