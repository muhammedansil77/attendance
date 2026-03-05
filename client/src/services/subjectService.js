import api from './api';

export const createSubject = async (subjectData) => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
};

export const getAllSubjects = async () => {
    const response = await api.get('/subjects');
    return response.data;
};

export const deleteSubject = async (id) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
};
