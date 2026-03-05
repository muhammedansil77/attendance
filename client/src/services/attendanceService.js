import api from './api';

export const markAttendance = async (attendanceData) => {
    const response = await api.post('/attendance/mark', attendanceData);
    return response.data;
};

export const getAttendance = async (filters) => {
    const response = await api.get('/attendance', { params: filters });
    return response.data;
};

export const getDashboardStats = async () => {
    const response = await api.get('/attendance/dashboard-stats');
    return response.data;
};

export const getMyAttendance = async (params) => {
    const response = await api.get('/attendance/my-attendance', { params });
    return response.data;
};

export const getMyStats = async (params) => {
    const response = await api.get('/attendance/my-stats', { params });
    return response.data;
};

export const getAttendanceStats = async (filters) => {
    const response = await api.get('/attendance/stats', { params: filters });
    return response.data;
};

export const markAbsentees = async (data) => {
    const response = await api.post('/attendance/mark-absentees', data);
    return response.data;
};
