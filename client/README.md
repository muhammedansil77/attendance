# AI Monitoring System - Frontend (React)

This is the client-side of the Smart Classroom Monitoring system, powered by **Vite**, **React**, and **face-api.js**.

## 🧠 AI Capabilities
The frontend handles all the "heavy lifting" for Computer Vision:
- **SSD Mobilenet v1**: High-accuracy face detection.
- **Face Landmark Detection**: 68-point mesh tracking for head orientation and eye focus.
- **Face Recognition**: Generates 128-dimensional descriptors to match students against the database.
- **实时 Behavior Monitoring**: Logic for detecting "Looking Down", "Looking Away", and "Drowsiness" in real-time.

## 📦 Key Packages
- `face-api.js`: All AI logic.
- `exceljs`: Frontend Excel generation for report downloads.
- `lucide-react`: Modern icon set.
- `axios`: API communication with the Node.js server.
- `react-router-dom`: Intelligent routing (Admin/Teacher/Student portals).

## 🚀 Running Locally
```bash
npm install
npm run dev
```

## 🏗️ Structure
- `/src/pages`: Functional portals (Scanner, Behavior Analysis, Reports).
- `/src/services`: API abstraction layers (Attendance, Student Management).
- `/src/utils`: AI initialization and face matching utilities.
- `/public/models`: Binary model weights required by face-api.js.
