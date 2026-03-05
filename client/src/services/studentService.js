import api from './api';

export const addStudent = async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
};

export const getAllStudents = async () => {
    const response = await api.get('/students');
    return response.data;
};

export const deleteStudent = async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
};

export const updateStudent = async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
};

export const loginStudent = async (credentials) => {
    const response = await api.post('/students/login', credentials);
    if (response.data.student) {
        localStorage.setItem('user', JSON.stringify(response.data.student));
    }
    return response.data;
};

export const logoutStudent = async () => {
    const response = await api.post('/students/logout');
    localStorage.removeItem('user');
    return response.data;
};

export const getStudentProfile = async () => {
    const response = await api.get('/students/profile');
    return response.data;
};
