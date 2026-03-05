import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import * as faceapi from 'face-api.js';
import { loadModels, createFaceMatcher } from '../utils/faceApi';
import { getAllStudents } from '../services/studentService';
import { logCheating } from '../services/cheatingService';
import { Brain, AlertTriangle, EyeOff, Moon, ArrowDown, UserX } from 'lucide-react';

const BehaviorAnalysis = () => {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [students, setStudents] = useState([]);
    const [faceMatcher, setFaceMatcher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [monitoredData, setMonitoredData] = useState({}); // studentId -> {name, behaviors: []}

    // Persistance Timers (per student)
    const persistence = useRef({}); // studentId -> { eyesClosedStart, headDownStart, lastSeen }

    useEffect(() => {
        const init = async () => {
            try {
                await loadModels();
                const studentData = await getAllStudents();
                setStudents(studentData);
                setFaceMatcher(createFaceMatcher(studentData));
                setModelsLoaded(true);
                setLoading(false);
                startVideo();
            } catch (err) {
                console.error("Initialization failed:", err);
                setLoading(false);
            }
        };
        init();
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
            .then(stream => { videoRef.current.srcObject = stream; })
            .catch(err => console.error("Camera error:", err));
    };

    const logEvent = async (studentId, type) => {
        const now = Date.now();

        if (!persistence.current[studentId]) {
            persistence.current[studentId] = { lastLogs: {} };
        }

        const lastLog = persistence.current[studentId].lastLogs?.[type] || 0;

        if (now - lastLog > 10000) { // 10s throttle
            console.log(`[AI Log] Attempting to log ${type} for ${studentId}`);
            try {
                await logCheating({
                    studentId: studentId === 'unknown' || studentId === 'none' ? null : studentId,
                    eventType: type
                });

                if (!persistence.current[studentId].lastLogs) {
                    persistence.current[studentId].lastLogs = {};
                }
                persistence.current[studentId].lastLogs[type] = now;
                console.log(`[AI Log] Successfully logged ${type}`);
            } catch (err) {
                console.error(`[AI Log Error] Failed to log ${type}:`, err);
            }
        }
    };

    const handleVideoPlay = () => {
        const interval = setInterval(async () => {
            if (!videoRef.current || !modelsLoaded || !faceMatcher) return;

            const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();

            const now = Date.now();
            const currentMonitored = {};

            detections.forEach(det => {
                const match = faceMatcher.findBestMatch(det.descriptor);
                const studentId = match.label;
                const studentObj = students.find(s => s._id === studentId);
                const name = studentObj ? studentObj.name : "Unknown Subject";

                if (!persistence.current[studentId]) {
                    persistence.current[studentId] = { eyesClosedStart: null, headDownStart: null, lastSeen: now, lastLogs: {} };
                }
                const p = persistence.current[studentId];
                p.lastSeen = now;

                const landmarks = det.landmarks;
                const behaviors = [];

                // 1. SLEEPY DETECTION (Eye Closure) - DROWSY
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();
                const getEyeHeight = (eye) => Math.abs(eye[1].y - eye[5].y) + Math.abs(eye[2].y - eye[4].y);
                const avgEyeHeight = (getEyeHeight(leftEye) + getEyeHeight(rightEye)) / 2;
                const isEyesClosed = avgEyeHeight < (det.detection.box.height * 0.015);

                if (isEyesClosed) {
                    if (!p.eyesClosedStart) p.eyesClosedStart = now;
                    if (now - p.eyesClosedStart > 3000) {
                        behaviors.push({ type: 'danger', icon: <Moon size={16} />, msg: 'Sleepy / Drowsy Detected' });
                        logEvent(studentId, 'DROWSY');
                    }
                } else {
                    p.eyesClosedStart = null;
                }

                // 2. HEAD DOWN DETECTION (Pitch)
                const nose = landmarks.getNose();
                const jaw = landmarks.getJawOutline();
                const eyeY = (leftEye[0].y + rightEye[0].y) / 2;
                const noseY = nose[0].y;
                const headHeight = det.detection.box.height;
                const verticalRatio = (noseY - eyeY) / headHeight;

                if (verticalRatio < 0.12) {
                    if (!p.headDownStart) p.headDownStart = now;
                    if (now - p.headDownStart > 3000) {
                        behaviors.push({ type: 'warning', icon: <ArrowDown size={16} />, msg: 'Head Down - Not Paying Attention' });
                        logEvent(studentId, 'LOOKING_DOWN');
                    }
                } else {
                    p.headDownStart = null;
                }

                // 3. LOOKING LEFT/RIGHT (Yaw)
                const noseX = nose[0].x;
                const jawLeft = jaw[0].x;
                const jawRight = jaw[16].x;
                const jawWidth = jawRight - jawLeft;
                const horizontalRatio = (noseX - jawLeft) / jawWidth;
                const yawAngle = (horizontalRatio - 0.5) * 180;

                if (Math.abs(yawAngle) > 25) {
                    behaviors.push({ type: 'info', icon: <EyeOff size={16} />, msg: 'Looking Away From Screen' });
                    logEvent(studentId, 'LOOKING_AWAY');
                }

                currentMonitored[studentId] = { name, behaviors };
            });

            if (detections.length === 0) {
                if (!persistence.current['global_missing']) persistence.current['global_missing'] = now;
                if (now - persistence.current['global_missing'] > 5000) {
                    setMonitoredData({ 'none': { name: 'System', behaviors: [{ type: 'secondary', icon: <UserX size={16} />, msg: 'Face Not Visible' }] } });
                    logEvent('none', 'FACE_NOT_VISIBLE');
                }
            } else {
                persistence.current['global_missing'] = null;
                setMonitoredData(currentMonitored);
            }

            // Draw bounding boxes
            if (canvasRef.current && videoRef.current) {
                const displaySize = { width: videoRef.current.clientWidth, height: videoRef.current.clientHeight };
                faceapi.matchDimensions(canvasRef.current, displaySize);
                const resized = faceapi.resizeResults(detections, displaySize);
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, displaySize.width, displaySize.height);

                resized.forEach(det => {
                    const match = faceMatcher.findBestMatch(det.descriptor);
                    const label = match.label !== 'unknown' ? students.find(s => s._id === match.label)?.name : "Unknown";
                    new faceapi.draw.DrawBox(det.detection.box, { label }).draw(canvasRef.current);
                });
            }
        }, 600);
        return () => clearInterval(interval);
    };

    return (
        <Layout>
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="d-flex align-items-center gap-2">
                        <Brain className="text-primary" /> Behavior Analysis Portal
                    </h2>
                    <div className="badge bg-success p-2">AI Engine Active</div>
                </div>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-lg bg-black overflow-hidden position-relative rounded-4" style={{ minHeight: '500px' }}>
                            <video ref={videoRef} autoPlay muted onPlay={handleVideoPlay} className="w-100 h-100" style={{ transform: 'scaleX(-1)' }} />
                            <canvas ref={canvasRef} className="position-absolute top-0 start-0 w-100 h-100" style={{ transform: 'scaleX(-1)', pointerEvents: 'none' }} />

                            {loading && (
                                <div className="position-absolute top-50 start-50 translate-middle text-center text-white">
                                    <div className="spinner-border text-primary mb-3" role="status"></div>
                                    <p className="fredoka">Waking Up AI Sense...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm p-4 h-100 bg-white rounded-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 border-bottom pb-2">
                                <AlertTriangle size={20} className="text-warning" /> Intelligence Feed
                            </h5>

                            <div className="overflow-auto" style={{ maxHeight: '600px' }}>
                                {Object.entries(monitoredData).map(([id, data]) => (
                                    <div key={id} className={`mb-4 p-3 rounded-3 border-start border-4 ${data.behaviors.length > 0 ? 'bg-danger bg-opacity-10 border-danger' : 'bg-light border-primary'}`}>
                                        <h6 className="fw-bold mb-2">{data.name}</h6>

                                        {data.behaviors.length > 0 ? (
                                            <div className="d-flex flex-column gap-2">
                                                {data.behaviors.map((b, idx) => (
                                                    <div key={idx} className={`alert alert-${b.type} py-2 px-3 m-0 d-flex align-items-center gap-2 border-0 shadow-sm animate__animated animate__fadeInRight`}>
                                                        {b.icon}
                                                        <small className="fw-bold">{b.msg}</small>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-success small mb-0 fw-medium">Student is attentive and engaged</p>
                                        )}
                                    </div>
                                ))}

                                {Object.keys(monitoredData).length === 0 && !loading && (
                                    <div className="text-center py-5 text-muted">
                                        <p>Scanning classroom for activity...</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-4">
                                <div className="bg-light p-3 rounded-3 small">
                                    <h6 className="fw-bold x-small text-uppercase text-muted mb-2">Analysis Logic</h6>
                                    <ul className="list-unstyled mb-0 opacity-75">
                                        <li>• <b>Drowsiness:</b> Closed eyes {'>'} 3s</li>
                                        <li>• <b>Distraction:</b> Head down {'>'} 3s</li>
                                        <li>• <b>Environment:</b> 25° angle threshold</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BehaviorAnalysis;
