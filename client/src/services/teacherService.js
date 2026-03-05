import api from './api';

export const loginTeacher = async (credentials) => {
    const response = await api.post('/teachers/login', credentials);
    if (response.data.teacher) {
        localStorage.setItem('user', JSON.stringify(response.data.teacher));
    }
    return response.data;
};

export const getTeacherDashboard = async () => {
    const response = await api.get('/teachers/dashboard');
    return response.data;
};

export const markAttendance = async (attendanceData) => {
    const response = await api.post('/teachers/mark-attendance', attendanceData);
    return response.data;
};

// Admin actions for teachers
export const createTeacher = async (teacherData) => {
    const response = await api.post('/admin/teachers', teacherData);
    return response.data;
};

export const getAllTeachers = async () => {
    const response = await api.get('/admin/teachers');
    return response.data;
};

export const toggleTeacherBlock = async (id) => {
    const response = await api.patch(`/admin/teachers/${id}/toggle-block`);
    return response.data;
};
