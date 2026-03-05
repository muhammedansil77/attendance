import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getAllTeachers, toggleTeacherBlock, createTeacher } from '../services/teacherService';
import { getAllSubjects } from '../services/subjectService';
import { getAllClasses } from '../services/classService';
import { UserPlus, UserX, UserCheck, Search, BookOpen, GraduationCap } from 'lucide-react';

const TeacherList = () => {
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        subjectId: '',
        classId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teacherData, subjectData, classData] = await Promise.all([
                getAllTeachers(),
                getAllSubjects(),
                getAllClasses()
            ]);
            setTeachers(teacherData);
            setSubjects(subjectData);
            setClasses(classData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (id) => {
        try {
            await toggleTeacherBlock(id);
            fetchData();
        } catch (error) {
            alert('Failed to toggle block status');
        }
    };

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        try {
            await createTeacher(formData);
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', subjectId: '', classId: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create teacher');
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Teacher Management</h2>
                    <p className="text-muted">Manage academic staff and assignments</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
                    <UserPlus size={18} /> Add New Teacher
                </button>
            </div>

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                        <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">Teacher Name</th>
                                <th>Subject</th>
                                <th>Class</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5">Loading teachers...</td></tr>
                            ) : filteredTeachers.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5">No teachers found</td></tr>
                            ) : (
                                filteredTeachers.map(teacher => (
                                    <tr key={teacher._id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                                                    <BookOpen size={20} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold">{teacher.name}</div>
                                                    <small className="text-muted">{teacher.email}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge bg-info bg-opacity-10 text-info px-3 py-2">
                                                {teacher.subjectId?.subjectName || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2">
                                                {teacher.classId?.className || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            {teacher.isBlocked ?
                                                <span className="badge bg-danger px-3 py-2">Blocked</span> :
                                                <span className="badge bg-success px-3 py-2">Active</span>
                                            }
                                        </td>
                                        <td className="text-end pe-4">
                                            <button
                                                className={`btn btn-sm ${teacher.isBlocked ? 'btn-outline-success' : 'btn-outline-danger'} d-inline-flex align-items-center gap-1`}
                                                onClick={() => handleToggleBlock(teacher._id)}
                                            >
                                                {teacher.isBlocked ? <UserCheck size={16} /> : <UserX size={16} />}
                                                {teacher.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Teacher Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Add New Teacher</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateTeacher}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            required
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Assign Subject</label>
                                            <select
                                                className="form-select"
                                                required
                                                value={formData.subjectId}
                                                onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map(s => (
                                                    <option key={s._id} value={s._id}>{s.subjectName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Assign Class</label>
                                            <select
                                                className="form-select"
                                                required
                                                value={formData.classId}
                                                onChange={e => setFormData({ ...formData, classId: e.target.value })}
                                            >
                                                <option value="">Select Class</option>
                                                {classes.map(c => (
                                                    <option key={c._id} value={c._id}>{c.className}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Create Teacher Account</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default TeacherList;
