import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getMyAttendance, getMyStats } from '../services/attendanceService';
import { getStudentProfile } from '../services/studentService';
import { Calendar, CheckCircle, XCircle, Clock, User, BookOpen, Mail, TrendingUp, Award, Activity } from 'lucide-react';

const StudentDashboard = () => {
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Default range: 1 month ago to today
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [profileData, statsData, logsData] = await Promise.all([
                    getStudentProfile(),
                    getMyStats({ startDate, endDate }),
                    getMyAttendance({ startDate, endDate })
                ]);
                setProfile(profileData);
                setStats(statsData);
                setAttendance(logsData);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [statsData, logsData] = await Promise.all([
                getMyStats({ startDate, endDate }),
                getMyAttendance({ startDate, endDate })
            ]);
            setStats(statsData);
            setAttendance(logsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile) return (
        <Layout>
            <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <p className="text-muted fw-bold">Calculating your intelligence metrics...</p>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <style>{`
                .glass-card {
                    background: rgba(255, 255, 255, 1);
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    transition: all 0.3s ease;
                }
                .glass-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
                .stat-icon { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 14px; }
                .progress-custom { height: 6px; border-radius: 10px; background: #f1f5f9; overflow: hidden; }
                .subject-matrix { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
                .subject-node { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 15px; }
            `}</style>

            <div className="container-fluid pb-5">
                {/* Header Profile Section */}
                <div className="row mb-5">
                    <div className="col-12">
                        <div className="glass-card shadow-sm p-4 overflow-hidden position-relative border-0" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white' }}>
                            <div className="d-flex align-items-center gap-4 position-relative z-1">
                                <div className="position-relative">
                                    <img
                                        src={profile?.photo || 'https://via.placeholder.com/150'}
                                        alt="Profile"
                                        className="rounded-circle border border-4 border-white shadow-lg"
                                        style={{ width: '110px', height: '110px', objectFit: 'cover' }}
                                    />
                                    <div className="position-absolute bottom-0 end-0 bg-success border border-white border-3 rounded-circle" style={{ width: '25px', height: '25px' }}></div>
                                </div>
                                <div>
                                    <h1 className="display-6 fw-800 mb-1">Welcome back, {profile?.name}!</h1>
                                    <div className="d-flex flex-wrap gap-3 opacity-90">
                                        <span className="d-flex align-items-center gap-1 small fw-bold"><BookOpen size={16} /> {profile?.classId?.className}</span>
                                        <span className="d-flex align-items-center gap-1 small fw-bold"><User size={16} /> ID: {profile?.registerNumber}</span>
                                        <span className="d-flex align-items-center gap-1 small fw-bold"><Award size={16} /> {stats?.overallPercentage}% Overall Attendance</span>
                                    </div>
                                </div>
                            </div>
                            <div className="position-absolute top-0 end-0 opacity-10 p-4"><TrendingUp size={200} /></div>
                        </div>
                    </div>
                </div>

                {/* Summary Metrics Row */}
                <div className="row g-4 mb-5">
                    <div className="col-md-3">
                        <div className="glass-card shadow-sm p-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stat-icon bg-primary bg-opacity-10 text-primary"><Clock size={24} /></div>
                                <div><h4 className="mb-0 fw-bold">{stats?.totalClassesAttended}</h4><small className="text-muted fw-bold uppercase">Total Sessions</small></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="glass-card shadow-sm p-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stat-icon bg-success bg-opacity-10 text-success"><CheckCircle size={24} /></div>
                                <div><h4 className="mb-0 fw-bold">{stats?.totalDaysPresent}</h4><small className="text-muted fw-bold uppercase">Active Days</small></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="glass-card shadow-sm p-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stat-icon bg-danger bg-opacity-10 text-danger"><XCircle size={24} /></div>
                                <div><h4 className="mb-0 fw-bold">{stats?.subjectStats?.reduce((acc, s) => acc + s.absentCount, 0)}</h4><small className="text-muted fw-bold uppercase">Missed sessions</small></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="glass-card shadow-sm p-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stat-icon bg-warning bg-opacity-10 text-warning"><Award size={24} /></div>
                                <div><h4 className="mb-0 fw-bold">{stats?.overallPercentage}%</h4><small className="text-muted fw-bold uppercase">Percentage</small></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Subject Analysis Matrix */}
                    <div className="col-lg-8">
                        <div className="glass-card shadow-sm p-4 h-100">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-800 text-dark mb-0 d-flex align-items-center gap-2"><Activity className="text-primary" size={20} /> Subject Analytics</h5>
                                <div className="d-flex gap-2">
                                    <input type="date" className="form-control form-control-sm border-0 bg-light rounded-pill px-3" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                    <input type="date" className="form-control form-control-sm border-0 bg-light rounded-pill px-3" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                    <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={refreshData}>Analyze</button>
                                </div>
                            </div>
                            <div className="subject-matrix">
                                {stats?.subjectStats?.map((sub, i) => (
                                    <div key={i} className="subject-node shadow-sm">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold text-dark text-truncate" style={{ maxWidth: '120px' }}>{sub.subjectName}</span>
                                            <span className={`badge ${sub.percentage < 75 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} rounded-pill`}>{sub.percentage}%</span>
                                        </div>
                                        <div className="progress-custom mb-2">
                                            <div className={`progress-bar ${sub.percentage < 75 ? 'bg-danger' : 'bg-success'}`} style={{ width: `${sub.percentage}%` }}></div>
                                        </div>
                                        <div className="d-flex justify-content-between small text-muted">
                                            <span>Attended: {sub.count}</span>
                                            <span>Total: {sub.sessionsConducted}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.subjectStats || stats.subjectStats.length === 0) && (
                                    <div className="col-12 text-center py-5 text-muted">No subject data recorded for this period.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Profile */}
                    <div className="col-lg-4">
                        <div className="glass-card shadow-sm p-4 h-100">
                            <h5 className="fw-800 text-dark mb-4 border-bottom pb-2">Institutional Profile</h5>
                            <div className="d-flex flex-column gap-4">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="stat-icon bg-light text-primary"><User size={20} /></div>
                                    <div><small className="text-muted d-block fw-bold lowercase">Registration</small><span className="fw-bold text-dark">{profile?.registerNumber}</span></div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="stat-icon bg-light text-success"><BookOpen size={20} /></div>
                                    <div><small className="text-muted d-block fw-bold lowercase">Department</small><span className="fw-bold text-dark">{profile?.department}</span></div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="stat-icon bg-light text-info"><Mail size={20} /></div>
                                    <div><small className="text-muted d-block fw-bold lowercase">Institutional Email</small><span className="fw-bold text-dark text-break">{profile?.email}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent activity Logs */}
                    <div className="col-12">
                        <div className="glass-card shadow-sm overflow-hidden border-0">
                            <div className="p-4 border-bottom bg-white">
                                <h5 className="fw-800 text-dark mb-0">Recent Activity Logs</h5>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="px-4 py-3 text-muted fw-bold" style={{ fontSize: '0.75rem' }}>SESSION DATE</th>
                                            <th className="py-3 text-muted fw-bold" style={{ fontSize: '0.75rem' }}>SUBJECT</th>
                                            <th className="py-3 text-muted fw-bold" style={{ fontSize: '0.75rem' }}>TIMESTAMP</th>
                                            <th className="py-3 text-center text-muted fw-bold" style={{ fontSize: '0.75rem' }}>PERFORMANCE STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendance.map((record) => (
                                            <tr key={record._id}>
                                                <td className="px-4 fw-bold text-dark">
                                                    {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td><span className="badge bg-secondary-subtle text-secondary border px-3 py-1">{record.subject}</span></td>
                                                <td className="text-muted"><Clock size={14} className="me-1" /> {record.time}</td>
                                                <td className="text-center">
                                                    <span className={`badge ${record.status === 'Present' ? 'bg-success-subtle text-success border-success-subtle' : 'bg-danger-subtle text-danger border-danger-subtle'} border px-3 py-2 rounded-pill`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {attendance.length === 0 && (
                                            <tr><td colSpan="4" className="text-center py-5 text-muted fw-bold">No activity detected </td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StudentDashboard;
