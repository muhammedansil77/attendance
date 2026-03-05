import api from './api';

export const logCheating = async (data) => {
    const response = await api.post('/cheating/log', data);
    return response.data;
};

export const getAllCheatingLogs = async () => {
    const response = await api.get('/cheating');
    return response.data;
};
