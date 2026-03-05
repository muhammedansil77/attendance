const Student = require('../models/Student');

exports.addStudent = async (req, res) => {
    try {
        console.log("Incoming student data:", { ...req.body, photo: req.body.photo?.substring(0, 50) + "...", password: '***' });
        const { name, registerNumber, classId, department, photo, faceDescriptor, email, password } = req.body;

        const existingStudent = await Student.findOne({ registerNumber });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this register number already exists' });
        }

        const newStudent = new Student({
            name,
            registerNumber,
            classId,
            department,
            photo,
            faceDescriptor,
            email,
            password
        });

        await newStudent.save();
        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('classId');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('classId');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Student updated successfully', student: updatedStudent });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const jwt = require('jsonwebtoken');

exports.loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findOne({ email });

        if (!student || !(await student.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: student._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({
            message: 'Logged in successfully',
            student: { id: student._id, name: student.name, email: student.email, registerNumber: student.registerNumber, role: 'student' }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logoutStudent = async (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

exports.getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.admin.id).populate('classId');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
