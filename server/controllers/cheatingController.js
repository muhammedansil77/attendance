const CheatingLog = require('../models/CheatingLog');

exports.logCheatingEvent = async (req, res) => {
    try {
        const { studentId, eventType } = req.body;
        const newLog = new CheatingLog({ studentId, eventType });
        await newLog.save();
        res.status(201).json({ message: 'Event logged successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCheatingLogs = async (req, res) => {
    try {
        const logs = await CheatingLog.find().populate('studentId').sort('-timestamp');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
