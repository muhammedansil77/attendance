# Smart Classroom Monitoring & Face Recognition Attendance (MERN)

A powerful, real-time classroom management system built on the **MERN Stack (MongoDB, Express, React, Node.js)**. This application uses client-side AI and computer vision to automate student attendance, identify cheating behaviors, and analyze student attention levels.

![Project Architecture](mern_ai_architecture_diagram_1772714910652.png)

---

## 🚀 Key Modules & Features

### 1. Smart Attendance System
- **Face Recognition**: Uses `face-api.js` to recognize students in a live camera feed. 
- **Automated Marking**: Marks students "Present" as soon as they are identified.
- **Teacher Mode**: Specialized portal for teachers to mark attendance for their specific assigned subjects and batches.

### 2. Proctored Behavioral Analysis
- **Cheating Detection**: Monitors for proctoring violations:
  - **Looking Away**: Detects when students look away from the test/screen for more than 2 seconds.
  - **Looking Down**: Detects potential phone/paper usage.
- **Attention Monitoring**: Analyzes focus levels (e.g., drowsiness detection, head orientation).
- **Incident Logs**: Automatically logs "Anomalies" to the database with student name and high/medium severity flags.

### 3. Comprehensive Reporting
- **Behavioral Reports**: A central hub to view all cheating alerts and attention anomalies.
- **Attendance History**: Daily/Monthly attendance stats for students and teachers.
- **Excel Export**: Integrated **ExcelJS** for downloading one-click reports for administrative review.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | High-performance SPA with Bootstrap 5 styling. |
| **AI Engine** | Face-api.js | Neural Networks (Mobilenet v1, Landmarks, Recognition) running on the client browser. |
| **Backend** | Node.js + Express | REST API for handling authentication and data persistence. |
| **Database** | MongoDB + Mongoose | Scalable storage for Student Profiles, Attendance, and Behavior Logs. |
| **Security** | JWT + Bcrypt | JSON Web Token authentication with secure password hashing. |
| **Reports** | ExcelJS | Professional-grade spreadsheet generation. |

---

## 🏗️ System Architecture

1. **Client Layer (React)**: Captures the camera stream, detects faces using local AI models, and triggers data syncs.
2. **Logic Layer (Node.js)**: Manages business logic, identifies teachers/admins, and processes attendance rules.
3. **Data Layer (MongoDB)**: Stores student face descriptors (vectors), logs all anomalous behavior events, and maintains attendance registers.

---

## 💻 Installation & Setup

### 1. Clone & Prerequisites
- Install **Node.js** (LTS version).
- Ensure a local **MongoDB** server is running.

### 2. Backend Setup
```bash
cd server
npm install
# Configure your .env (MONGODB_URI, JWT_SECRET, PORT)
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 4. Admin Credentials (Default)
- **Account:** `admin@example.com`
- **Password:** `admin`

---

## 📁 Source Overview
- `/client/src/pages`: User interfaces for behavior analysis, attendance, and reports.
- `/client/src/utils/faceApi.js`: Core AI implementation (model loading & matching).
- `/server/controllers`: Database logic for logging incidents and marking attendance.
- `/client/public/models`: Pre-trained Weights for the AI Neural Networks (SSD, Landmarks, etc.)
