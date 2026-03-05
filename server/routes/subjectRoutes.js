const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, subjectController.createSubject);
router.get('/', auth, subjectController.getAllSubjects);
router.delete('/:id', auth, subjectController.deleteSubject);

module.exports = router;
