const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, classController.addClass);
router.get('/', auth, classController.getAllClasses);
router.delete('/:id', auth, classController.deleteClass);

module.exports = router;
