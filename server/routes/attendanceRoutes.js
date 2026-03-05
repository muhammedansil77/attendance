const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/authMiddleware');

router.post('/mark', auth, attendanceController.markAttendance);
router.get('/', auth, attendanceController.getAttendance);
router.get('/dashboard-stats', auth, attendanceController.getDashboardStats);
router.get('/my-attendance', auth, attendanceController.getStudentAttendance);
router.get('/my-stats', auth, attendanceController.getStudentStats);
router.get('/stats', auth, attendanceController.getAttendanceStats);
router.post('/mark-absentees', auth, attendanceController.markAbsentees);

module.exports = router;
