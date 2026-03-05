import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import * as faceapi from 'face-api.js';
import { loadModels, createFaceMatcher } from '../utils/faceApi';
import { logCheating } from '../services/cheatingService';
import { getAllStudents } from '../services/studentService';
import { AlertCircle, ShieldAlert, UserX, User, Info } from 'lucide-react';

const CheatingDetection = () => {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [students, setStudents] = useState([]);
    const [faceMatcher, setFaceMatcher] = useState(null);
    const [identifiedStudents, setIdentifiedStudents] = useState({}); // Map of id -> {name, headTurn, verticalPosition, warning}
    const [warning, setWarning] = useState(null); // Keep global warning for last major event
    const [loading, setLoading] = useState(true);

    // Timers for logging (per student ID)
    const timers = useRef({}); // { studentId: { faceMissing, lookingDown, lastLogs: { TYPE: Time } } }

    useEffect(() => {
        const init = async () => {
            try {
                await loadModels();
                const studentData = await getAllStudents();
                setStudents(studentData);
                const matcher = createFaceMatcher(studentData);
                setFaceMatcher(matcher);
                setModelsLoaded(true);
                setLoading(false);
                startVideo();
            } catch (err) {
                console.error(err);
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
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                videoRef.current.srcObject = stream;
            })
            .catch(err => console.error(err));
    };

    const handleVideoPlay = () => {
        const interval = setInterval(async () => {
            if (!videoRef.current || !modelsLoaded || !faceMatcher) return;

            const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();

            const currentDetections = {};

            detections.forEach((detection) => {
                const match = faceMatcher.findBestMatch(detection.descriptor);
                const studentId = match.label !== 'unknown' ? match.label : `Unknown-${Math.random().toString(36).substr(2, 5)}`;
                const studentData = students.find(s => s._id === studentId);
                const studentName = studentData ? studentData.name : "Unknown";

                // Initialize timers/logs for this ID if not exists
                if (!timers.current[studentId]) {
                    timers.current[studentId] = { faceMissing: null, lookingDown: null, lastLogs: {} };
                }

                const landmarks = detection.landmarks;
                const nose = landmarks.getNose();
                const jaw = landmarks.getJawOutline();

                // 1. HEAD TURN DETECTION
                const nosePoint = nose[0];
                const jawLeft = jaw[0];
                const jawRight = jaw[16];
                const jawWidth = jawRight.x - jawLeft.x;
                const angle = ((nosePoint.x - jawLeft.x) / jawWidth - 0.5) * 180;

                // 2. LOOKING DOWN DETECTION
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();
                const eyeY = (leftEye[0].y + rightEye[0].y) / 2;
                const noseY = nose[0].y;
                const verticalRatio = (noseY - eyeY) / detection.detection.box.height;

                currentDetections[studentId] = {
                    name: studentName,
                    headTurn: angle,
                    verticalPosition: verticalRatio,
                    warning: null
                };

                // Warnings per student
                if (Math.abs(angle) > 25) {
                    triggerWarning(studentId, "Looking Away", "LOOKING_AWAY");
                    currentDetections[studentId].warning = "Looking Away";
                }

                if (verticalRatio < 0.15) {
                    if (!timers.current[studentId].lookingDown) {
                        timers.current[studentId].lookingDown = setTimeout(() => {
                            triggerWarning(studentId, "Looking Down", "LOOKING_DOWN");
                        }, 5000);
                    }
                } else {
                    clearTimeout(timers.current[studentId].lookingDown);
                    timers.current[studentId].lookingDown = null;
                }
            });

            setIdentifiedStudents(currentDetections);

            // Draw on canvas
            if (canvasRef.current && videoRef.current) {
                const displaySize = { width: videoRef.current.clientWidth, height: videoRef.current.clientHeight };
                faceapi.matchDimensions(canvasRef.current, displaySize);
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                resizedDetections.forEach((det, i) => {
                    const match = faceMatcher.findBestMatch(det.descriptor);
                    const label = match.label !== 'unknown' ? students.find(s => s._id === match.label)?.name : "Stranger";
                    new faceapi.draw.DrawBox(det.detection.box, { label }).draw(canvasRef.current);
                    faceapi.draw.drawFaceLandmarks(canvasRef.current, det);
                });
            }
        }, 800);

        return () => clearInterval(interval);
    };

    const triggerWarning = (studentId, msg, type) => {
        setWarning(`${msg}`);

        const now = Date.now();
        const lastLog = timers.current[studentId]?.lastLogs[type] || 0;

        if (now - lastLog > 10000) {
            logCheating({
                studentId: studentId.startsWith('Unknown') ? null : studentId,
                eventType: type
            });
            if (timers.current[studentId]) {
                timers.current[studentId].lastLogs[type] = now;
            }
        }

        setTimeout(() => setWarning(null), 3000);
    };

    return (
        <Layout>
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Cheating Detection System</h2>
                    <div className="badge bg-primary fs-6">Real-time Monitoring Active</div>
                </div>

                <div className="row">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm overflow-hidden position-relative" style={{ backgroundColor: '#000' }}>
                            <video
                                ref={videoRef}
                                onPlay={handleVideoPlay}
                                autoPlay
                                muted
                                width="100%"
                                height="auto"
                                style={{ transform: 'scaleX(-1)' }}
                            />
                            <canvas
                                ref={canvasRef}
                                className="position-absolute top-0 start-0"
                                style={{ width: '100%', height: '100%', transform: 'scaleX(-1)', pointerEvents: 'none' }}
                            />

                            {warning && (
                                <div className="position-absolute bottom-0 start-0 end-0 p-4 animate__animated animate__shakeX">
                                    <div className="alert alert-danger shadow-lg d-flex align-items-center gap-3 py-3 border-start border-5 border-danger">
                                        <ShieldAlert size={32} />
                                        <h4 className="mb-0 fw-bold">{warning}</h4>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm p-4 h-100 overflow-auto" style={{ maxHeight: '90vh' }}>
                            <h5 className="border-bottom pb-2 mb-4">Subjects Monitored ({Object.keys(identifiedStudents).length})</h5>

                            <div className="d-flex flex-column gap-3">
                                {Object.entries(identifiedStudents).map(([id, data]) => (
                                    <div key={id} className={`p-3 rounded border-start border-4 ${data.warning ? 'bg-danger bg-opacity-10 border-danger' : 'bg-primary bg-opacity-10 border-primary'}`}>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h6 className="mb-0 fw-bold">{data.name}</h6>
                                                <small className="text-muted">{id.startsWith('Unknown') ? 'Unregistered' : 'Verified Student'}</small>
                                            </div>
                                            {data.warning && (
                                                <span className="badge bg-danger animate__animated animate__pulse animate__infinite">
                                                    {data.warning}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            <div className="d-flex justify-content-between x-small mb-1">
                                                <span>Orientation</span>
                                                <span className={Math.abs(data.headTurn) > 25 ? 'text-danger fw-bold' : ''}>
                                                    {Math.round(data.headTurn)}°
                                                </span>
                                            </div>
                                            <div className="progress" style={{ height: '4px' }}>
                                                <div
                                                    className={`progress-bar ${Math.abs(data.headTurn) > 25 ? 'bg-danger' : 'bg-primary'}`}
                                                    style={{ width: `${Math.min(100, Math.abs(data.headTurn * 2))}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="mt-2">
                                            <div className="d-flex justify-content-between x-small mb-1">
                                                <span>Focus</span>
                                                <span className={data.verticalPosition < 0.15 ? 'text-danger fw-bold' : ''}>
                                                    {Math.round(data.verticalPosition * 100)}%
                                                </span>
                                            </div>
                                            <div className="progress" style={{ height: '4px' }}>
                                                <div
                                                    className={`progress-bar ${data.verticalPosition < 0.15 ? 'bg-danger' : 'bg-success'}`}
                                                    style={{ width: `${data.verticalPosition * 200}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {Object.keys(identifiedStudents).length === 0 && (
                                    <div className="text-center py-5 text-muted">
                                        <UserX size={48} className="mb-3 opacity-25" />
                                        <p>No subjects detected in frame</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-4 border-top">
                                <h6 className="d-flex align-items-center gap-2 mb-3">
                                    <AlertCircle size={18} className="text-warning" />
                                    Active Monitoring Rules
                                </h6>
                                <ul className="list-unstyled small mb-0 opacity-75">
                                    <li className="mb-1">• Head Turn Threshold: 25°</li>
                                    <li className="mb-1">• Looking Down Delay: 5s</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CheatingDetection;
