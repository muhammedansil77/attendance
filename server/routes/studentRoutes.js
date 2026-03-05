const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/authMiddleware');

router.post('/login', studentController.loginStudent);
router.post('/logout', studentController.logoutStudent);
router.get('/profile', auth, studentController.getStudentProfile);

router.post('/', auth, studentController.addStudent);
router.get('/', auth, studentController.getAllStudents);
router.get('/:id', auth, studentController.getStudentById);
router.put('/:id', auth, studentController.updateStudent);
router.delete('/:id', auth, studentController.deleteStudent);

module.exports = router;
