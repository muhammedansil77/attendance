const mongoose = require('mongoose');

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/attendance_monitoring');
        const db = mongoose.connection.db;
        const collection = db.collection('attendances');

        const records = await collection.find({}).toArray();
        console.log('Total records:', records.length);

        const recordsWithoutSubject = records.filter(r => !r.subject);
        console.log('Records without subject:', recordsWithoutSubject.length);

        if (recordsWithoutSubject.length > 0) {
            console.log('Sample record without subject:', recordsWithoutSubject[0]);
        }

        const distinctSubjects = [...new Set(records.map(r => r.subject))];
        console.log('Distinct subjects in Attendance records:', distinctSubjects);

        const Subject = mongoose.model('Subject', new mongoose.Schema({ subjectName: String }));
        const subjectsInDb = await Subject.find();
        console.log('Subjects in Subject collection:', subjectsInDb.map(s => s.subjectName));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

check();
