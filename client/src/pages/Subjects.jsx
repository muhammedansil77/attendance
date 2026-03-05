import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getAllSubjects, createSubject, deleteSubject } from '../services/subjectService';
import { Plus, Trash2, BookOpen } from 'lucide-react';

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSubject, setNewSubject] = useState({ subjectName: '', subjectCode: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const data = await getAllSubjects();
            setSubjects(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createSubject(newSubject);
            setNewSubject({ subjectName: '', subjectCode: '' });
            setMessage({ type: 'success', text: 'Subject created successfully' });
            fetchSubjects();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: error.response?.data?.message || 'Error creating subject' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await deleteSubject(id);
                setMessage({ type: 'success', text: 'Subject deleted successfully' });
                fetchSubjects();
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (error) {
                setMessage({ type: 'danger', text: 'Error deleting subject' });
            }
        }
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Subjects</h2>
                <div className="badge bg-primary p-2 fs-6">
                    Total Subjects: {subjects.length}
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                </div>
            )}

            <div className="row">
                <div className="col-md-4">
                    <div className="card shadow-sm border-0 p-4">
                        <h5 className="mb-4 d-flex align-items-center gap-2">
                            <Plus size={20} /> Add New Subject
                        </h5>
                        <form onSubmit={handleCreate}>
                            <div className="mb-3">
                                <label className="form-label">Subject Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Mathematics"
                                    value={newSubject.subjectName}
                                    onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Subject Code</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. MATH101"
                                    value={newSubject.subjectCode}
                                    onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Create Subject</button>
                        </form>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Subject Name</th>
                                        <th>Subject Code</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center">Loading subjects...</td></tr>
                                    ) : subjects.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center">No subjects found</td></tr>
                                    ) : (
                                        subjects.map((sub, index) => (
                                            <tr key={sub._id}>
                                                <td>{index + 1}</td>
                                                <td className="fw-bold">{sub.subjectName}</td>
                                                <td><span className="badge bg-secondary-subtle text-secondary">{sub.subjectCode}</span></td>
                                                <td className="text-end">
                                                    <button
                                                        className="btn btn-link text-danger p-0"
                                                        onClick={() => handleDelete(sub._id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Subjects;
