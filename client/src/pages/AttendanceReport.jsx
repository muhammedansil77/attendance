import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getAttendance } from '../services/attendanceService';
import { getAllClasses } from '../services/classService';
import { getAllSubjects } from '../services/subjectService';
import { Download, Search, Filter } from 'lucide-react';
import ExcelJS from 'exceljs';

const AttendanceReport = () => {
    const [records, setRecords] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        date: new Date().toISOString().split('T')[0],
        classId: '',
        subject: ''
    });

    const [sortOrder, setSortOrder] = useState('none');

    useEffect(() => {
        const init = async () => {
            try {
                const classData = await getAllClasses();
                setClasses(classData);

                const subjectData = await getAllSubjects();
                setSubjects(subjectData);

                fetchRecords();
            } catch (error) {
                console.error(error);
            }
        };
        init();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const data = await getAttendance(filters);
            setRecords(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance Report');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Time', key: 'time', width: 15 },
            { header: 'Subject', key: 'subject', width: 20 },
            { header: 'Register No', key: 'regNo', width: 20 },
            { header: 'Student Name', key: 'name', width: 30 },
            { header: 'Class', key: 'class', width: 15 },
            { header: 'Status', key: 'status', width: 10 }
        ];

        sortedRecords.forEach(record => {
            worksheet.addRow({
                date: record.date,
                time: record.time,
                subject: record.subject,
                regNo: record.studentId?.registerNumber,
                name: record.studentId?.name,
                class: record.studentId?.classId?.className,
                status: record.status
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `Attendance_Report_${filters.date || 'Export'}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
    };

    const sortedRecords = [...records].sort((a, b) => {
        const nameA = a.studentId?.name?.toLowerCase() || '';
        const nameB = b.studentId?.name?.toLowerCase() || '';
        if (sortOrder === 'asc') return nameA.localeCompare(nameB);
        if (sortOrder === 'desc') return nameB.localeCompare(nameA);
        return 0;
    });

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Attendance Reports</h2>
                <button className="btn btn-outline-success d-flex align-items-center gap-2" onClick={handleExport}>
                    <Download size={18} /> Export Excel
                </button>
            </div>

            <div className="card shadow-sm border-0 mb-4 p-4 bg-white">
                <div className="row g-3">
                    <div className="col-md-2">
                        <label className="form-label text-dark">Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label text-dark">Class</label>
                        <select
                            className="form-select"
                            value={filters.classId}
                            onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label text-dark">Subject</label>
                        <select
                            className="form-select"
                            value={filters.subject}
                            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(s => <option key={s._id} value={s.subjectName}>{s.subjectName}</option>)}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label text-dark">Sort Name</label>
                        <select
                            className="form-select"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="none">Default</option>
                            <option value="asc">Name: A-Z</option>
                            <option value="desc">Name: Z-A</option>
                        </select>
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                        <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" onClick={fetchRecords}>
                            <Search size={18} /> Search
                        </button>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Subject</th>
                                <th>Register No</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRecords.map((record) => (
                                <tr key={record._id}>
                                    <td>{record.date}</td>
                                    <td>{record.time}</td>
                                    <td><span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">{record.subject}</span></td>
                                    <td>{record.studentId?.registerNumber}</td>
                                    <td>{record.studentId?.name}</td>
                                    <td>{record.studentId?.classId?.className}</td>
                                    <td>
                                        <span className={`badge border ${record.status === 'Absent' ? 'bg-danger-subtle text-danger border-danger-subtle' : 'bg-success-subtle text-success border-success-subtle'}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {records.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">No attendance records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default AttendanceReport;
