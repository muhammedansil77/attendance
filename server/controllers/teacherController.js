const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

// Admin: Create Teacher
exports.createTeacher = async (req, res) => {
    try {
        const { name, email, password, subjectId, classId } = req.body;

        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ message: 'Teacher with this email already exists' });
        }

        const teacher = new Teacher({
            name,
            email,
            password,
            subjectId,
            classId
        });

        await teacher.save();
        res.status(201).json({ message: 'Teacher created successfully', teacher });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get All Teachers
exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .populate('subjectId', 'subjectName subjectCode')
            .populate('classId', 'className department');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Toggle Block/Unblock
exports.toggleBlockStatus = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        teacher.isBlocked = !teacher.isBlocked;
        await teacher.save();
        res.json({ message: `Teacher ${teacher.isBlocked ? 'blocked' : 'unblocked'} successfully`, teacher });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Teacher: Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const teacher = await Teacher.findOne({ email });

        if (!teacher) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (teacher.isBlocked) {
            return res.status(403).json({ message: 'Your account is blocked. Please contact admin.' });
        }

        const isMatch = await teacher.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: teacher._id, role: 'teacher' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Login successful',
            teacher: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                role: 'teacher'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Teacher: Dashboard details
exports.getDashboard = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.teacher.id)
            .populate('subjectId')
            .populate('classId');

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const students = await Student.find({ classId: teacher.classId });

        res.json({
            teacher: {
                name: teacher.name,
                subject: teacher.subjectId,
                class: teacher.classId
            },
            students
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Teacher: Mark Attendance
exports.markAttendance = async (req, res) => {
    try {
        const { studentId, status, date } = req.body;
        const teacher = await Teacher.findById(req.teacher.id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Create or update attendance
        const attendanceDate = date ? new Date(date).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            studentId,
            subjectId: teacher.subjectId,
            date: attendanceDate
        });

        if (attendance) {
            attendance.status = status;
        } else {
            attendance = new Attendance({
                studentId,
                classId: teacher.classId,
                subjectId: teacher.subjectId,
                status,
                date: attendanceDate
            });
        }

        await attendance.save();
        res.json({ message: 'Attendance marked successfully', attendance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
