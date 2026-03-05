import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ScanLine, FileBarChart, BookOpen, LogOut, ShieldAlert, GraduationCap, Brain } from 'lucide-react';
import { logout as logoutAdmin } from '../services/adminService';
import { logoutStudent } from '../services/studentService';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin' || !user?.role; // Default to admin for old sessions
    const isTeacher = user?.role === 'teacher';
    const isStudent = user?.role === 'student';

    const handleLogout = async () => {
        try {
            if (isAdmin) {
                await logoutAdmin();
            } else if (isStudent) {
                await logoutStudent();
            } else {
                // Teacher logout (clears token cookie exactly like admin)
                await logoutAdmin();
            }
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="sidebar-container min-vh-100 d-flex flex-column pt-4" style={{ width: '280px' }}>
            {/* Branding Section */}
            <div className="px-4 mb-5">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                        {isAdmin ? <ShieldAlert className="text-primary" size={28} /> :
                            isTeacher ? <BookOpen className="text-warning" size={28} /> :
                                <GraduationCap className="text-info" size={28} />}
                    </div>
                    <div>
                        <h5 className="branding-text fw-bold mb-0" style={{ letterSpacing: '0.5px' }}>
                            {isAdmin ? 'AMS Admin' : isTeacher ? 'Teacher Portal' : 'Student Portal'}
                        </h5>
                        <small className="text-primary fw-semibold" style={{ fontSize: '0.65rem' }}>PREMIUM EDITION</small>
                    </div>
                </div>
            </div>

            <nav className="flex-grow-1 overflow-auto custom-scrollbar">
                {isAdmin && (
                    <>
                        <div className="sidebar-section-title">Main Dashboard</div>
                        <NavLink to="/dashboard" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <LayoutDashboard size={18} /> <span>Dashboard</span>
                        </NavLink>

                        <div className="sidebar-section-title">Academic Management</div>
                        <NavLink to="/students" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <Users size={18} /> <span>Students</span>
                        </NavLink>
                        <NavLink to="/teachers" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <Users size={18} /> <span>Teachers</span>
                        </NavLink>
                        <NavLink to="/classes" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <BookOpen size={18} /> <span>Classes</span>
                        </NavLink>
                        <NavLink to="/subjects" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <BookOpen size={18} /> <span>Subjects</span>
                        </NavLink>

                        <div className="sidebar-section-title">AI Powered Tools</div>
                        <NavLink to="/scanner" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <ScanLine size={18} /> <span>Face Scanner</span>
                        </NavLink>
                        <NavLink to="/cheating" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <ShieldAlert size={18} /> <span>Cheating Detection</span>
                        </NavLink>
                        <NavLink to="/behavior" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <Brain size={18} /> <span>Behavior Analysis</span>
                        </NavLink>

                        <div className="sidebar-section-title">Analytics</div>
                        <NavLink to="/reports" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <FileBarChart size={18} /> <span>Attendance Reports</span>
                        </NavLink>
                        <NavLink to="/attendance-stats" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <FileBarChart size={18} /> <span>Attendance Analytics</span>
                        </NavLink>
                    </>
                )}

                {isTeacher && (
                    <>
                        <div className="sidebar-section-title">Teacher Menu</div>
                        <NavLink to="/teacher-dashboard" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <LayoutDashboard size={18} /> <span>Teacher Dashboard</span>
                        </NavLink>
                        <NavLink to="/teacher-scanner" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <ScanLine size={18} /> <span>Face Scanner</span>
                        </NavLink>
                        <NavLink to="/reports" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <FileBarChart size={18} /> <span>Class Reports</span>
                        </NavLink>
                    </>
                )}

                {isStudent && (
                    <>
                        <div className="sidebar-section-title">Student Portal</div>
                        <NavLink to="/student-dashboard" className={({ isActive }) => `nav-link sidebar-glass-link d-flex align-items-center gap-3 rounded-3 p-2 px-3 ${isActive ? 'sidebar-link-active' : ''}`}>
                            <LayoutDashboard size={18} /> <span>My Insights</span>
                        </NavLink>
                    </>
                )}
            </nav>

            {/* Profile & Logout Section */}
            <div className="mt-auto border-top border-light p-2">
                <div className="profile-card d-flex align-items-center gap-3 mb-2 shadow-sm">
                    <div className="bg-primary text-white p-2 rounded-circle fw-bold d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px', fontSize: '0.8rem' }}>
                        {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="profile-name small fw-bold mb-0 text-truncate">{user?.name || user?.username || 'Authorized User'}</p>
                        <p className="text-muted x-small mb-0 text-truncate" style={{ fontSize: '0.65rem' }}>{user?.email || 'Active Session'}</p>
                    </div>
                </div>

                <button onClick={handleLogout} className="nav-link logout-btn-premium d-flex align-items-center gap-3 p-2 px-4 border-0 bg-transparent text-start w-100">
                    <LogOut size={18} /> <span className="fw-semibold">Logout System</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
