import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getDashboardStats } from '../services/attendanceService';
import { Users, UserCheck, UserX, Percent } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Layout><div className="text-center mt-5">Loading...</div></Layout>;

    const chartData = {
        labels: stats?.last7Days.map(d => d.date) || [],
        datasets: [
            {
                label: 'Present Students',
                data: stats?.last7Days.map(d => d.count) || [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3
            }
        ]
    };

    return (
        <Layout>
            <h2 className="mb-4">Dashboard Overview</h2>
            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <div className="card h-100 shadow-sm border-0 bg-info bg-opacity-10">
                        <div className="card-body d-flex align-items-center">
                            <div className="p-3 bg-info rounded text-white me-3">
                                <Users />
                            </div>
                            <div>
                                <small className="text-muted d-block">Total Students</small>
                                <h3 className="mb-0">{stats?.totalStudents}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card h-100 shadow-sm border-0 bg-success bg-opacity-10">
                        <div className="card-body d-flex align-items-center">
                            <div className="p-3 bg-success rounded text-white me-3">
                                <UserCheck />
                            </div>
                            <div>
                                <small className="text-muted d-block">Today Present</small>
                                <h3 className="mb-0">{stats?.todayPresent}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card h-100 shadow-sm border-0 bg-danger bg-opacity-10">
                        <div className="card-body d-flex align-items-center">
                            <div className="p-3 bg-danger rounded text-white me-3">
                                <UserX />
                            </div>
                            <div>
                                <small className="text-muted d-block">Today Absent</small>
                                <h3 className="mb-0">{stats?.todayAbsent}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card h-100 shadow-sm border-0 bg-warning bg-opacity-10">
                        <div className="card-body d-flex align-items-center">
                            <div className="p-3 bg-warning rounded text-white me-3">
                                <Percent />
                            </div>
                            <div>
                                <small className="text-muted d-block">Attendance %</small>
                                <h3 className="mb-0">{stats?.attendancePercentage.toFixed(1)}%</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 p-4">
                <h5 className="mb-4">Attendance Trend (Last 7 Days)</h5>
                <div style={{ height: '300px' }}>
                    <Line data={chartData} options={{ maintainAspectRatio: false }} />
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
