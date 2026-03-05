const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const teacherController = require('../controllers/teacherController');
const auth = require('../middleware/authMiddleware');

router.post('/login', adminController.login);
router.post('/logout', adminController.logout);
router.get('/me', auth, adminController.getAdminDetails);

// Teacher Management
router.post('/teachers', auth, teacherController.createTeacher);
router.get('/teachers', auth, teacherController.getAllTeachers);
router.patch('/teachers/:id/toggle-block', auth, teacherController.toggleBlockStatus);

module.exports = router;
