import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getAllClasses, addClass, deleteClass } from '../services/classService';
import { Plus, Trash2 } from 'lucide-react';

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const [newClassName, setNewClassName] = useState('');
    const [department, setDepartment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const data = await getAllClasses();
            setClasses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        try {
            await addClass({ className: newClassName, department });
            setNewClassName('');
            setDepartment('');
            fetchClasses();
        } catch (error) {
            alert('Error adding class');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await deleteClass(id);
            fetchClasses();
        } catch (error) {
            alert('Error deleting class');
        }
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Classes</h2>
            </div>

            <div className="card shadow-sm border-0 mb-4 p-4">
                <h5>Add New Class</h5>
                <form onSubmit={handleAddClass} className="row g-3">
                    <div className="col-md-5">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Class Name (e.g. CS-A)"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-5">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-2">
                        <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
                            <Plus size={18} /> Add
                        </button>
                    </div>
                </form>
            </div>

            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Class Name</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((cls) => (
                                <tr key={cls._id}>
                                    <td>{cls.className}</td>
                                    <td>{cls.department}</td>
                                    <td>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleDelete(cls._id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {classes.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="3" className="text-center py-4 text-muted">No classes found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default ClassList;
