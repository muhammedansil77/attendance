import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getTeacherDashboard, markAttendance } from '../services/teacherService';
import { BookOpen, GraduationCap, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';

const TeacherDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [markingDate, setMarkingDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const result = await getTeacherDashboard();
            setData(result);
        } catch (error) {
            console.error('Error fetching teacher dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (studentId, status) => {
        try {
            await markAttendance({
                studentId,
                status,
                date: markingDate
            });
            // Update local state to reflect change immediately if needed, 
            // but for simplicity we can just show a toast or log
            console.log(`Marked ${status} for ${studentId}`);
            // To be more reactive, we could refresh data or update the student in the list
            fetchDashboard();
        } catch (error) {
            alert('Failed to mark attendance');
        }
    };

    if (loading) return <Layout><div className="text-center mt-5">Loading Dashboard...</div></Layout>;
    if (!data) return <Layout><div className="text-center mt-5">Error loading dashboard</div></Layout>;

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Teacher Dashboard</h2>
                    <p className="text-muted">Manage attendance for your assigned class</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => window.location.href = '/teacher-scanner'}
                >
                    <BookOpen size={18} /> Open Smart Scanner
                </button>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 bg-primary bg-opacity-10 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="bg-primary text-white p-3 rounded-3">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <small className="text-muted d-block">Assigned Subject</small>
                                <h4 className="fw-bold mb-0">{data.teacher.subject?.subjectName}</h4>
                                <small className="text-primary fw-semibold">{data.teacher.subject?.subjectCode}</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 bg-info bg-opacity-10 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="bg-info text-white p-3 rounded-3">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <small className="text-muted d-block">Assigned Class</small>
                                <h4 className="fw-bold mb-0">{data.teacher.class?.className}</h4>
                                <small className="text-info fw-semibold">{data.teacher.class?.department}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <Users className="text-muted" size={20} />
                        <h5 className="mb-0 fw-bold">Student List ({data.students.length})</h5>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <div className="input-group input-group-sm" style={{ width: '200px' }}>
                            <span className="input-group-text bg-white border-end-0"><Calendar size={14} /></span>
                            <input
                                type="date"
                                className="form-control border-start-0"
                                value={markingDate}
                                onChange={(e) => setMarkingDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">Reg Number</th>
                                <th>Student Name</th>
                                <th className="text-center">Mark Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.students.map(student => (
                                <tr key={student._id}>
                                    <td className="ps-4 fw-semibold text-primary">{student.registerNumber}</td>
                                    <td>
                                        <div className="fw-bold">{student.name}</div>
                                        <small className="text-muted">{student.email}</small>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button
                                                className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                                                onClick={() => handleMarkAttendance(student._id, 'Present')}
                                            >
                                                <CheckCircle size={16} /> Present
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                                onClick={() => handleMarkAttendance(student._id, 'Absent')}
                                            >
                                                <XCircle size={16} /> Absent
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default TeacherDashboard;
