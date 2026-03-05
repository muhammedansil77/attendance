const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Class = require('../models/Class');

exports.markAttendance = async (req, res) => {
    try {
        const { studentId, date, time, subject } = req.body;

        if (!subject) {
            return res.status(400).json({ message: 'Subject is required' });
        }

        // Check if already marked for today and subject
        const existing = await Attendance.findOne({ studentId, date, subject });
        if (existing) {
            return res.status(400).json({ message: 'Attendance already marked for this subject today' });
        }

        const newAttendance = new Attendance({
            studentId,
            date,
            time,
            subject,
            status: 'Present'
        });

        await newAttendance.save();
        res.status(201).json({ message: 'Attendance marked successfully', attendance: newAttendance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const { date, startDate, endDate, classId, subject } = req.query;
        let query = {};

        if (date) {
            query.date = date;
        } else if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        if (subject) {
            query.subject = subject;
        }

        let attendanceRecords = await Attendance.find(query)
            .populate({
                path: 'studentId',
                populate: { path: 'classId' }
            })
            .sort({ createdAt: -1 });

        if (classId) {
            attendanceRecords = attendanceRecords.filter(record =>
                record.studentId &&
                record.studentId.classId &&
                (record.studentId.classId._id?.toString() === classId || record.studentId.classId.toString() === classId)
            );
        }

        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const totalStudents = await Student.countDocuments();

        // Count unique students present today across any subject
        const presentStudentIds = await Attendance.distinct('studentId', { date: today });
        const todayPresent = presentStudentIds.length;

        const todayAbsent = totalStudents - todayPresent;
        const attendancePercentage = totalStudents > 0 ? (todayPresent / totalStudents) * 100 : 0;

        // Stats for graph (last 7 days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const presentIds = await Attendance.distinct('studentId', { date: dateStr });
            last7Days.push({ date: dateStr, count: presentIds.length });
        }

        res.json({
            totalStudents,
            todayPresent,
            todayAbsent,
            attendancePercentage,
            last7Days
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentStats = async (req, res) => {
    try {
        const studentId = req.admin.id; // From auth middleware
        const { startDate, endDate } = req.query;

        const student = await Student.findById(studentId).populate('classId');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const subjects = await Subject.find();

        let attendanceQuery = { studentId };
        if (startDate && endDate) {
            attendanceQuery.date = { $gte: startDate, $lte: endDate };
        }

        const studentAttendance = await Attendance.find(attendanceQuery);
        const presentRecords = studentAttendance.filter(a => a.status === 'Present');

        // Also get global attendance to calculate total sessions conducted per subject
        const allAttendance = await Attendance.find(startDate && endDate ? { date: { $gte: startDate, $lte: endDate } } : {});

        const subjectStats = subjects.map(subject => {
            const subjectAttendance = presentRecords.filter(a => a.subject === subject.subjectName);
            const count = subjectAttendance.length;

            const sessionsConducted = new Set(
                allAttendance.filter(a => a.subject === subject.subjectName).map(a => a.date)
            ).size || 1;

            const percentage = ((count / sessionsConducted) * 100).toFixed(1);
            return {
                subjectName: subject.subjectName,
                count,
                absentCount: sessionsConducted - count,
                sessionsConducted,
                percentage: parseFloat(percentage)
            };
        });

        const totalClassesAttended = presentRecords.length;
        const totalSessionsConducted = subjectStats.reduce((acc, curr) => acc + curr.sessionsConducted, 0);
        const overallPercentage = totalSessionsConducted > 0 ? ((totalClassesAttended / totalSessionsConducted) * 100).toFixed(1) : 0;

        res.json({
            name: student.name,
            registerNumber: student.registerNumber,
            className: student.classId?.className,
            subjectStats,
            totalClassesAttended,
            totalDaysPresent: new Set(presentRecords.map(a => a.date)).size,
            overallPercentage: parseFloat(overallPercentage)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentAttendance = async (req, res) => {
    try {
        const studentId = req.admin.id;
        const { startDate, endDate } = req.query;
        let query = { studentId };

        if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        const attendance = await Attendance.find(query).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAbsentees = async (req, res) => {
    try {
        const { date, subject, classId } = req.body;

        if (!date || !subject || !classId) {
            return res.status(400).json({ message: 'Date, subject, and classId are required' });
        }

        // 1. Get all students in the class
        const allStudentsInClass = await Student.find({ classId });

        // 2. Get students already marked (Present) for this date and subject
        const presentRecords = await Attendance.find({ date, subject });
        const presentStudentIds = presentRecords.map(r => r.studentId.toString());

        // 3. Filter out students who are NOT marked present
        const absentStudents = allStudentsInClass.filter(
            student => !presentStudentIds.includes(student._id.toString())
        );

        if (absentStudents.length === 0) {
            return res.json({ message: 'All students are already marked present' });
        }

        // 4. Create Absent records
        const time = new Date().toLocaleTimeString();
        const absentRecords = absentStudents.map(student => ({
            studentId: student._id,
            date,
            subject,
            time,
            status: 'Absent'
        }));

        await Attendance.insertMany(absentRecords, { ordered: false }).catch(err => {
            // Ignore duplicate key errors if some were already marked absent
            console.log('Some records were already present');
        });

        res.json({
            message: `Marked ${absentStudents.length} students as absent`,
            count: absentStudents.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAttendanceStats = async (req, res) => {
    try {
        const { classId, startDate, endDate } = req.query;
        let studentsQuery = {};
        if (classId) {
            studentsQuery.classId = classId;
        }

        const students = await Student.find(studentsQuery).populate('classId');
        const subjects = await Subject.find();

        // Define attendance query
        let attendanceQuery = {};
        if (startDate && endDate) {
            attendanceQuery.date = { $gte: startDate, $lte: endDate };
        }

        const attendance = await Attendance.find(attendanceQuery);

        const stats = students.map(student => {
            const studentAttendance = attendance.filter(a => a.studentId.toString() === student._id.toString());
            const presentRecords = studentAttendance.filter(a => a.status === 'Present');

            // Total unique days any 'Present' attendance was recorded
            const totalDaysPresent = new Set(presentRecords.map(a => a.date)).size;

            const subjectStats = subjects.map(subject => {
                const subjectAttendance = presentRecords.filter(a => a.subject === subject.subjectName);
                const count = subjectAttendance.length; // Only 'Present' count

                // Dynamically calculate sessions conducted for this subject so far 
                // by checking total unique days any student was marked (Present OR Absent) for it
                const sessionsConducted = new Set(
                    attendance.filter(a => a.subject === subject.subjectName).map(a => a.date)
                ).size || 1;

                const percentage = ((count / sessionsConducted) * 100).toFixed(1);
                return {
                    subjectName: subject.subjectName,
                    count, // Present count
                    absentCount: sessionsConducted - count, // Absent = Total Days - Days Present
                    sessionsConducted,
                    percentage: parseFloat(percentage)
                };
            });

            const totalClassesAttended = presentRecords.length;
            const totalSessionsConducted = subjectStats.reduce((acc, curr) => acc + curr.sessionsConducted, 0);
            const overallPercentage = totalSessionsConducted > 0 ? ((totalClassesAttended / totalSessionsConducted) * 100).toFixed(1) : 0;

            return {
                studentId: student._id,
                name: student.name,
                registerNumber: student.registerNumber,
                className: student.classId?.className,
                subjectStats,
                totalClassesAttended,
                totalDaysPresent,
                overallPercentage: parseFloat(overallPercentage)
            };
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
