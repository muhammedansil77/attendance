const Class = require('../models/Class');

exports.addClass = async (req, res) => {
    try {
        const { className, department } = req.body;
        const newClass = new Class({ className, department });
        await newClass.save();
        res.status(201).json({ message: 'Class added successfully', class: newClass });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find();
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
