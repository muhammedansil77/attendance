const express = require('express');
const router = express.Router();
const cheatingController = require('../controllers/cheatingController');
const auth = require('../middleware/authMiddleware');

router.post('/log', cheatingController.logCheatingEvent);
router.get('/', auth, cheatingController.getCheatingLogs);

module.exports = router;
