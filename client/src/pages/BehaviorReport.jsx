import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getAllCheatingLogs } from '../services/cheatingService';
import { Download, Search, AlertTriangle, ShieldAlert, Moon, UserX, EyeOff, Brain } from 'lucide-react';
import ExcelJS from 'exceljs';

const BehaviorReport = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        eventType: '',
        category: '' // 'CHEATING', 'BEHAVIOR', ''
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await getAllCheatingLogs();
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Student Behavior Report');

        worksheet.columns = [
            { header: 'Date & Time', key: 'timestamp', width: 25 },
            { header: 'Event Category', key: 'category', width: 15 },
            { header: 'Anomaly Type', key: 'eventType', width: 20 },
            { header: 'Student Name', key: 'name', width: 25 },
            { header: 'Reg No', key: 'regNo', width: 20 }
        ];

        filteredLogs.forEach(log => {
            const isCheating = ['LOOKING_AWAY', 'LOOKING_DOWN'].includes(log.eventType);
            worksheet.addRow({
                timestamp: new Date(log.timestamp).toLocaleString(),
                category: isCheating ? 'CHEATING' : 'BEHAVIOR',
                eventType: log.eventType.replace(/_/g, ' '),
                name: log.studentId?.name || 'Unknown',
                regNo: log.studentId?.registerNumber || 'N/A'
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `Anomalies_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
    };

    const filteredLogs = logs.filter(log => {
        if (filters.eventType && log.eventType !== filters.eventType) return false;
        if (filters.category === 'CHEATING') return ['LOOKING_AWAY', 'LOOKING_DOWN'].includes(log.eventType);
        if (filters.category === 'BEHAVIOR') return ['DROWSY', 'FACE_NOT_VISIBLE', 'LOOKING_DOWN', 'LOOKING_AWAY'].includes(log.eventType);
        return true;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'LOOKING_AWAY': return <EyeOff className="text-info" size={18} />;
            case 'LOOKING_DOWN': return <AlertTriangle className="text-warning" size={18} />;
            case 'DROWSY': return <Moon className="text-danger" size={18} />;
            case 'FACE_NOT_VISIBLE': return <UserX className="text-secondary" size={18} />;
            default: return <ShieldAlert size={18} />;
        }
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Behavior & Cheating Reports</h2>
                    <p className="text-muted">AI-logged anomalies and student activity records</p>
                </div>
                <button
                    className="btn btn-outline-success d-flex align-items-center gap-2 shadow-sm"
                    onClick={handleExport}
                >
                    <Download size={18} /> Export Excel
                </button>
            </div>

            <div className="card shadow-sm border-0 mb-4 p-4 bg-white rounded-4 shadow-lg">
                <div className="row g-3">
                    <div className="col-md-3">
                        <label className="form-label fw-bold small text-muted">Category</label>
                        <select
                            className="form-select border-2"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <option value="">All Anomalies</option>
                            <option value="CHEATING">Proctoring / Cheating</option>
                            <option value="BEHAVIOR">Behavioral Analysis</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold small text-muted">Event Type</label>
                        <select
                            className="form-select border-2"
                            value={filters.eventType}
                            onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                        >
                            <option value="">Specific Event...</option>
                            <option value="LOOKING_AWAY">Looking Away</option>
                            <option value="LOOKING_DOWN">Looking Down</option>
                            <option value="DROWSY">Drowsy / Sleeping</option>
                            <option value="FACE_NOT_VISIBLE">Face Not Visible</option>
                        </select>
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                        <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow" onClick={fetchLogs}>
                            <Search size={18} /> Sync Latest
                        </button>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden border-top">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">Timestamp</th>
                                <th>Student Context</th>
                                <th>Anomaly Type</th>
                                <th className="text-center">Severity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => {
                                const isCheating = ['LOOKING_AWAY', 'LOOKING_DOWN'].includes(log.eventType);
                                return (
                                    <tr key={log._id}>
                                        <td className="ps-4">
                                            <div className="fw-bold">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                            <small className="text-muted">{new Date(log.timestamp).toLocaleDateString()}</small>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className={`p-2 rounded-circle ${isCheating ? 'bg-danger-subtle' : 'bg-info-subtle'}`}>
                                                    {isCheating ? <ShieldAlert className="text-danger" size={16} /> : <Brain className="text-info" size={16} />}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{log.studentId?.name || 'Unrecognized Subject'}</div>
                                                    <small className="text-muted">
                                                        {log.studentId ? `Reg: ${log.studentId.registerNumber}` : 'ID Tracking: Anonymous'} •
                                                        <span className="ms-1">{log.studentId?.classId?.className || 'External / Guest'}</span>
                                                    </small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column">
                                                <span className={`badge w-fit mb-1 ${isCheating ? 'bg-danger' : 'bg-primary'}`} style={{ width: 'fit-content', fontSize: '10px' }}>
                                                    {isCheating ? 'CHEATING' : 'BEHAVIOR'}
                                                </span>
                                                <div className="d-flex align-items-center gap-2 fw-semibold">
                                                    {getIcon(log.eventType)}
                                                    {log.eventType.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            {log.eventType === 'DROWSY' || log.eventType === 'LOOKING_AWAY' ? (
                                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-3">High</span>
                                            ) : (
                                                <span className="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle px-3">Medium</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredLogs.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        <ShieldAlert size={48} className="mb-3 opacity-25" />
                                        <p className="mb-0">No behavioral anomalies found in current filtered view</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default BehaviorReport;
