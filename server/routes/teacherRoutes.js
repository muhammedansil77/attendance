const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const auth = require('../middleware/authMiddleware');

// Teacher Auth
router.post('/login', teacherController.login);

// Teacher Dashboard (Assigned subject, class, students)
router.get('/dashboard', auth, teacherController.getDashboard);

// Mark Attendance
router.post('/mark-attendance', auth, teacherController.markAttendance);

module.exports = router;
