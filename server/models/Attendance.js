const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    time: {
        type: String, // Format: HH:mm:ss
        required: true
    },
    status: {
        type: String,
        default: 'Present'
    },
    subject: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Ensure unique attendance per student per day per subject
attendanceSchema.index({ studentId: 1, date: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
