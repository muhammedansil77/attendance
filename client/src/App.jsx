import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import ClassList from './pages/ClassList';
import AttendanceScanner from './pages/AttendanceScanner';
import AttendanceReport from './pages/AttendanceReport';
import CheatingDetection from './pages/CheatingDetection';
import StudentDashboard from './pages/StudentDashboard';
import BehaviorAnalysis from './pages/BehaviorAnalysis';
import Subjects from './pages/Subjects';
import AttendanceStats from './pages/AttendanceStats';
import TeacherList from './pages/TeacherList';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAttendanceScanner from './pages/TeacherAttendanceScanner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher-scanner" element={<TeacherAttendanceScanner />} />
        <Route path="/behavior" element={<BehaviorAnalysis />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/teachers" element={<TeacherList />} />
        <Route path="/classes" element={<ClassList />} />
        <Route path="/scanner" element={<AttendanceScanner />} />
        <Route path="/reports" element={<AttendanceReport />} />
        <Route path="/cheating" element={<CheatingDetection />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/attendance-stats" element={<AttendanceStats />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
