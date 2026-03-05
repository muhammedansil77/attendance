import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginAdmin } from '../services/adminService';
import { loginStudent } from '../services/studentService';
import { loginTeacher } from '../services/teacherService';
import { Lock, User, GraduationCap, ShieldCheck, BookOpen } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('admin'); // 'admin', 'student', or 'teacher'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (role === 'admin') {
                await loginAdmin({ username: email, password });
                navigate('/dashboard');
            } else if (role === 'teacher') {
                await loginTeacher({ email, password });
                navigate('/teacher-dashboard');
            } else {
                await loginStudent({ email, password });
                navigate('/student-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-primary bg-gradient">
            <div className="card shadow-lg" style={{ width: '450px', borderRadius: '20px' }}>
                <div className="card-body p-4">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold mb-1">Welcome Back</h2>
                        <p className="text-muted">Sign in to your account</p>
                    </div>

                    <div className="d-flex bg-light p-1 rounded-pill mb-4 shadow-sm" style={{ gap: '4px' }}>
                        <button
                            className={`btn flex-grow-1 rounded-pill d-flex align-items-center justify-content-center gap-1 py-2 ${role === 'admin' ? 'btn-primary shadow-sm' : 'btn-light border-0'}`}
                            onClick={() => setRole('admin')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            <ShieldCheck size={16} /> Admin
                        </button>
                        <button
                            className={`btn flex-grow-1 rounded-pill d-flex align-items-center justify-content-center gap-1 py-2 ${role === 'teacher' ? 'btn-primary shadow-sm' : 'btn-light border-0'}`}
                            onClick={() => setRole('teacher')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            <BookOpen size={16} /> Teacher
                        </button>
                        <button
                            className={`btn flex-grow-1 rounded-pill d-flex align-items-center justify-content-center gap-1 py-2 ${role === 'student' ? 'btn-primary shadow-sm' : 'btn-light border-0'}`}
                            onClick={() => setRole('student')}
                            style={{ fontSize: '0.85rem' }}
                        >
                            <GraduationCap size={16} /> Student
                        </button>
                    </div>

                    <h4 className="text-center mb-4 fredoka">
                        {role === 'admin' ? 'Admin Portal' : role === 'teacher' ? 'Teacher Portal' : 'Student Portal'}
                    </h4>

                    {error && <div className="alert alert-danger py-2">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">{role === 'admin' ? 'Username' : 'Email Address'}</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><User size={20} className="text-muted" /></span>
                                <input
                                    type={role === 'admin' ? 'text' : 'email'}
                                    className="form-control border-start-0 ps-0"
                                    placeholder={role === 'admin' ? 'Enter admin username' : 'Enter your email'}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Lock size={20} className="text-muted" /></span>
                                <input
                                    type="password"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : null}
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    {role === 'admin' && (
                        <div className="text-center mt-4">
                            <small className="text-muted">Default Admin: <span className="fw-bold">admin / admin</span></small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
