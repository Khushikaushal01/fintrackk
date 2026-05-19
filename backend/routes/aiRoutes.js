const express = require('express');
const router = express.Router();
const { processAIQuestion } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.route('/ask').post(protect, processAIQuestion);

module.exports = router;
