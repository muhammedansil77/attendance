import React, { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import { getAllStudents, addStudent, deleteStudent } from '../services/studentService';
import { getAllClasses } from '../services/classService';
import { loadModels, getFaceDescriptor } from '../utils/faceApi';
import { Plus, Trash2, Camera, UserPlus, X } from 'lucide-react';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        registerNumber: '',
        classId: '',
        department: '',
        photo: '',
        email: '',
        password: ''
    });
    const [extracting, setExtracting] = useState(false);
    const [descriptor, setDescriptor] = useState(null);
    const imgRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            try {
                console.log("Initializing Student Management: Loading models...");
                await loadModels();
                console.log("Models loaded successfully");
                setModelsLoaded(true);
                fetchData();
            } catch (error) {
                console.error('CRITICAL: Failed to load face-api models:', error);
                alert("Error: Artificial Intelligence models could not be loaded. Please check your internet connection or if the models exist in /public/models.");
            }
        };
        init();
    }, []);

    const fetchData = async () => {
        try {
            const [studentData, classData] = await Promise.all([
                getAllStudents(),
                getAllClasses()
            ]);
            setStudents(studentData);
            setClasses(classData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const photoData = reader.result;
                setFormData({ ...formData, photo: photoData });
                setDescriptor(null);

                // Auto-extract face
                if (modelsLoaded) {
                    setExtracting(true);
                    try {
                        // We need a small delay to ensure the img element has updated its src
                        setTimeout(async () => {
                            if (imgRef.current) {
                                const desc = await getFaceDescriptor(imgRef.current);
                                if (desc) {
                                    setDescriptor(desc);
                                    console.log("Face features extracted automatically");
                                } else {
                                    alert('No face detected. Please use a clearer photo where the student is looking directly at the camera.');
                                }
                                setExtracting(false);
                            }
                        }, 500);
                    } catch (error) {
                        console.error("Auto-extraction error:", error);
                        setExtracting(false);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!descriptor) {
            alert('Please extract face descriptor first by clicking the "Extract Face" button');
            return;
        }

        const payload = { ...formData, faceDescriptor: descriptor };
        console.log("Submitting student data:", { ...payload, photo: payload.photo.substring(0, 50) + "..." });

        try {
            const res = await addStudent(payload);
            console.log("Student saved:", res);
            setShowAddForm(false);
            setFormData({ name: '', registerNumber: '', classId: '', department: '', photo: '', email: '', password: '' });
            setDescriptor(null);
            fetchData();
            alert('Student added successfully!');
        } catch (error) {
            console.error("Submit error:", error);
            const msg = error.response?.data?.message || error.message || 'Error adding student';
            alert(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await deleteStudent(id);
            fetchData();
        } catch (error) {
            alert('Error deleting student');
        }
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Student Management</h2>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => setShowAddForm(true)}
                >
                    <UserPlus size={18} /> Add Student
                </button>
            </div>

            {showAddForm && (
                <div className="card shadow-sm border-0 mb-4 p-4 position-relative">
                    <button
                        className="btn btn-sm btn-light position-absolute top-0 end-0 m-3"
                        onClick={() => setShowAddForm(false)}
                    >
                        <X size={18} />
                    </button>
                    <h5>Add New Student</h5>
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Full Name</label>
                            <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Register Number</label>
                            <input type="text" className="form-control" value={formData.registerNumber} onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Class</label>
                            <select className="form-select" value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} required>
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Department</label>
                            <input type="text" className="form-control" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Email Address</label>
                            <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Password</label>
                            <input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Photo Upload</label>
                            <input type="file" className="form-control" accept="image/*" onChange={handlePhotoChange} required />
                        </div>
                        <div className="col-md-6 d-flex align-items-center gap-3">
                            {formData.photo && (
                                <>
                                    <div className="position-relative">
                                        <img
                                            ref={imgRef}
                                            src={formData.photo}
                                            alt="Preview"
                                            crossOrigin="anonymous"
                                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                            className={`rounded border-3 ${descriptor ? 'border-success' : 'border-warning'}`}
                                        />
                                        {extracting && (
                                            <div className="position-absolute top-50 start-50 translate-middle">
                                                <div className="spinner-border text-primary" role="status"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        {extracting ? (
                                            <span className="text-primary fw-bold">Scanning Face...</span>
                                        ) : descriptor ? (
                                            <span className="text-success fw-bold d-flex align-items-center gap-1">
                                                <UserPlus size={16} /> Face Verified
                                            </span>
                                        ) : (
                                            <span className="text-danger small">
                                                Face not found yet. Please try a clearer photo.
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="col-12 mt-4 text-end">
                            <button type="submit" className="btn btn-success px-5 py-2 fw-bold shadow-sm" disabled={!descriptor || extracting}>
                                {extracting ? 'Scanning Face...' : descriptor ? 'Save Student Now' : 'Upload Face Photo to Enable'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Photo</th>
                                <th>Reg No</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Department</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student._id}>
                                    <td>
                                        <img src={student.photo} alt={student.name} style={{ width: '40px', height: '40px', objectFit: 'cover' }} className="rounded-circle" />
                                    </td>
                                    <td>{student.registerNumber}</td>
                                    <td>{student.name}</td>
                                    <td>{student.classId?.className}</td>
                                    <td>{student.department}</td>
                                    <td>
                                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(student._id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">No students found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default StudentList;
