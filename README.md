<<<<<<< HEAD
# Class Activity Monitoring System with Face Recognition Attendance

A modern MERN application for automated student attendance tracking using face recognition.

## Tech Stack
- **Frontend:** React.js, Bootstrap, Face-api.js, Chart.js, ExcelJS
- **Backend:** Node.js, Express.js, MongoDB
- **Auth:** JWT with HTTP-only cookies

## Features
- **Admin Dashboard:** Statistical overview of attendance (Total, Present, Absent, Percentage).
- **Student Management:** Add students with photo upload and face descriptor extraction.
- **Face Recognition Scanner:** Real-time webcam scanning with automatic attendance marking.
- **Attendance Reports:** Filterable records (Daily, Weekly, Monthly, Class-wise) with Excel export.
- **Secure Auth:** JWT-based login for administrators.

## Installation

### Prerequisites
- Node.js installed
- Local MongoDB running (or update `.env` with Atlas URI)

### Setup
1. **Backend:**
   ```bash
   cd server
   npm install
   # Configure .env file (already created)
   node server.js
   ```

2. **Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Default Credentials
- **Username:** `admin`
- **Password:** `admin`

## Folder Structure
- `/server`: Express backend with Models, Routes, and Controllers.
- `/client`: React frontend with Pages, Components, and Services.
- `/client/public/models`: Pre-trained face-api.js models.
=======
# attendance
Student Attendance Management System
>>>>>>> 1be5c01a4f4fb4c7de10a50378753e3da5c19e9a
