const express = require('express');
const multer = require('multer');
const { uploadData } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/data', protect, upload.any(), uploadData);

module.exports = router;