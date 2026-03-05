import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getAttendanceStats } from '../services/attendanceService';
import { getAllClasses } from '../services/classService';
import { Search, Info, TrendingUp, Users, Award, AlertCircle } from 'lucide-react';

const AttendanceStats = () => {
    const [stats, setStats] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        classId: '',
        startDate: '',
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const init = async () => {
            try {
                const classData = await getAllClasses();
                setClasses(classData);
                fetchStats();
            } catch (error) {
                console.error(error);
            }
        };
        init();
    }, []);

    const setQuickRange = (months) => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - months);

        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        setFilter({ ...filter, startDate: startStr, endDate: endStr });
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await getAttendanceStats(filter);
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Summary Metrics
    const classAvg = stats.length > 0
        ? (stats.reduce((acc, s) => acc + s.overallPercentage, 0) / stats.length).toFixed(1)
        : 0;

    const lowAttendanceCount = stats.filter(s => s.overallPercentage < 75).length;

    return (
        <Layout>
            <style>{`
                .glass-card {
                    background: rgba(255, 255, 255, 1);
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    transition: all 0.3s ease;
                }
                .glass-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important;
                }
                .filter-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #64748b;
                    transition: all 0.2s;
                }
                .filter-btn:hover, .filter-btn.active {
                    background: #6366f1;
                    color: white;
                    border-color: #6366f1;
                }
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                }
                .progress-custom {
                    height: 6px;
                    border-radius: 10px;
                    background: #f1f5f9;
                    overflow: hidden;
                }
                .table-premium th {
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.7rem;
                    letter-spacing: 0.05em;
                    color: #64748b;
                    padding: 1.25rem 1rem;
                    background: #f8fafc;
                }
                .subject-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 12px;
                    min-width: 170px;
                    flex: 1;
                }
                .percentage-badge {
                    width: 54px;
                    height: 54px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 1rem;
                }
                .avatar-placeholder {
                    width: 40px;
                    height: 40px;
                    background: #6366f1;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }
            `}</style>

            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <h2 className="fw-bold text-dark mb-0">Attendance Analytics</h2>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                        System Intelligence Live
                    </span>
                </div>
                <p className="text-muted">Detailed performance matrix and subject-wise attendance tracking.</p>
            </div>

            {/* Metrics Dashboard */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="glass-card shadow-sm p-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                                <Users size={22} />
                            </div>
                            <div>
                                <h4 className="mb-0 fw-bold">{stats.length}</h4>
                                <small className="text-muted">Strength</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="glass-card shadow-sm p-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon bg-success bg-opacity-10 text-success">
                                <TrendingUp size={22} />
                            </div>
                            <div>
                                <h4 className="mb-0 fw-bold">{classAvg}%</h4>
                                <small className="text-muted">Class Avg</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="glass-card shadow-sm p-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon bg-danger bg-opacity-10 text-danger">
                                <AlertCircle size={22} />
                            </div>
                            <div>
                                <h4 className="mb-0 fw-bold">{lowAttendanceCount}</h4>
                                <small className="text-muted">Risky (&lt;75%)</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="glass-card shadow-sm p-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                                <Award size={22} />
                            </div>
                            <div>
                                <h4 className="mb-0 fw-bold">{stats.filter(s => s.overallPercentage > 90).length}</h4>
                                <small className="text-muted">Star Students</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card shadow-sm p-4 mb-4">
                <div className="row g-4">
                    <div className="col-lg-3">
                        <label className="small fw-bold text-muted mb-2 d-block">Filter Class</label>
                        <select
                            className="form-select border-0 bg-light rounded-3"
                            value={filter.classId}
                            onChange={(e) => setFilter({ ...filter, classId: e.target.value })}
                        >
                            <option value="">Global Overview</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                        </select>
                    </div>
                    <div className="col-lg-5">
                        <label className="small fw-bold text-muted mb-2 d-block">Custom Date Range</label>
                        <div className="d-flex gap-2">
                            <input
                                type="date"
                                className="form-control border-0 bg-light rounded-3"
                                value={filter.startDate}
                                onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                            />
                            <span className="align-self-center text-muted">to</span>
                            <input
                                type="date"
                                className="form-control border-0 bg-light rounded-3"
                                value={filter.endDate}
                                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <label className="small fw-bold text-muted mb-2 d-block">Quick Filters</label>
                        <div className="d-flex gap-2">
                            <button className="filter-btn" onClick={() => setQuickRange(1)}>1M</button>
                            <button className="filter-btn" onClick={() => setQuickRange(3)}>3M</button>
                            <button className="filter-btn" onClick={() => setQuickRange(6)}>6M</button>
                            <button className="btn btn-primary rounded-3 px-3 ms-auto" onClick={fetchStats}>
                                <TrendingUp size={16} className="me-1" /> Analyze
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card shadow-sm overflow-hidden border-0">
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead className="table-premium">
                            <tr>
                                <th style={{ width: '25%' }}>Student Portfolio</th>
                                <th style={{ width: '45%' }}>Subject Breakdown</th>
                                <th className="text-center">Score</th>
                                <th className="text-center">Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-5">
                                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                    <span className="text-muted">Building Analytics...</span>
                                </td></tr>
                            ) : stats.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-5 text-muted">No records found.</td></tr>
                            ) : (
                                stats.map((student) => (
                                    <tr key={student.studentId}>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="avatar-placeholder">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{student.name}</div>
                                                    <div className="d-flex gap-2 align-items-center">
                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>{student.registerNumber}</small>
                                                        <span className="badge bg-light text-dark border p-1" style={{ fontSize: '0.6rem' }}>{student.className}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-2">
                                                {student.subjectStats?.map((sub, i) => (
                                                    <div key={i} className="subject-card shadow-none">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <div className="fw-bold text-muted text-truncate" style={{ fontSize: '0.65rem', maxWidth: '80px' }}>{sub.subjectName}</div>
                                                            <div className={`fw-bold ${sub.percentage < 75 ? 'text-danger' : 'text-success'}`} style={{ fontSize: '0.7rem' }}>{sub.percentage}%</div>
                                                        </div>
                                                        <div className="progress-custom mb-1">
                                                            <div className={`progress-bar ${sub.percentage < 75 ? 'bg-danger' : 'bg-success'}`} style={{ width: `${sub.percentage}%` }}></div>
                                                        </div>
                                                        <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.55rem' }}>
                                                            <span>Present: {sub.count}</span>
                                                            <span>Total: {sub.sessionsConducted}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-inline-flex flex-column align-items-center">
                                                <div className="percentage-badge" style={{
                                                    background: student.overallPercentage < 75 ? '#fef2f2' : '#f0fdf4',
                                                    color: student.overallPercentage < 75 ? '#ef4444' : '#22c55e',
                                                    border: `2px solid ${student.overallPercentage < 75 ? '#fee2e2' : '#dcfce7'}`
                                                }}>
                                                    {student.overallPercentage}%
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="text-dark fw-bold mb-0" style={{ fontSize: '0.9rem' }}>{student.totalClassesAttended}</div>
                                            <small className="text-muted d-block" style={{ fontSize: '0.6rem' }}>Total Sessions</small>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default AttendanceStats;
