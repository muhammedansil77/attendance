import api from './api';

export const login = async (credentials) => {
    const response = await api.post('/admin/login', credentials);
    if (response.data.admin) {
        localStorage.setItem('user', JSON.stringify({ ...response.data.admin, role: 'admin' }));
    }
    return response.data;
};

export const logout = async () => {
    const response = await api.post('/admin/logout');
    return response.data;
};

export const getAdminDetails = async () => {
    const response = await api.get('/admin/me');
    return response.data;
};
