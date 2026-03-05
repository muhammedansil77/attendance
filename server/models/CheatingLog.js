const mongoose = require('mongoose');

const cheatingLogSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: false // Optional if no student is currently matched
    },
    eventType: {
        type: String,
        required: true,
        enum: ['LOOKING_AWAY', 'LOOKING_DOWN', 'FACE_NOT_VISIBLE', 'DROWSY']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CheatingLog', cheatingLogSchema);
