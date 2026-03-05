const mongoose = require('mongoose');

// Define temporary schemas to avoid MissingSchemaError
const classSchema = new mongoose.Schema({ className: String });
const studentSchema = new mongoose.Schema({ name: String, registerNumber: String, classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' } });
const subjectSchema = new mongoose.Schema({ subjectName: String });
const attendanceSchema = new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId, subject: String, date: String });

async function test() {
    try {
        await mongoose.connect('mongodb://localhost:27017/attendance_monitoring');

        // Check if models exist or use existing ones
        const Class = mongoose.models.Class || mongoose.model('Class', classSchema);
        const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
        const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
        const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

        const students = await Student.find().populate('classId');
        const subjects = await Subject.find();
        const attendance = await Attendance.find();

        console.log('Total Students:', students.length);
        console.log('Total Subjects:', subjects.length);
        console.log('Total Attendance Records:', attendance.length);

        if (students.length > 0) {
            const student = students[0];
            const studentAttendance = attendance.filter(a => a.studentId && a.studentId.toString() === student._id.toString());
            console.log(`Analyzing Student: ${student.name}, Records: ${studentAttendance.length}`);

            if (subjects.length > 0) {
                const sub = subjects[0];
                const subAtt = studentAttendance.filter(a => a.subject === sub.subjectName);
                console.log(`Analyzing Subject: ${sub.subjectName}, Records: ${subAtt.length}`);
                const percentage = ((subAtt.length / 30) * 100).toFixed(1);
                console.log(`Percentage: ${percentage}%`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

test();
