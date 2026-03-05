import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import Layout from '../components/Layout';
import { getAllStudents } from '../services/studentService';
import { markAttendance, markAbsentees } from '../services/attendanceService';
import { getTeacherDashboard } from '../services/teacherService';
import { loadModels, createFaceMatcher } from '../utils/faceApi';
import { Camera, RefreshCw, Play, Square, CheckCircle, BookOpen, GraduationCap } from 'lucide-react';

const TeacherAttendanceScanner = () => {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [loading, setLoading] = useState(true);
    const [faceMatcher, setFaceMatcher] = useState(null);
    const [status, setStatus] = useState('Initializing...');
    const [detectionInfo, setDetectionInfo] = useState({ name: '', confidence: 0 });
    const [teacherData, setTeacherData] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [presentCount, setPresentCount] = useState(0);

    const teacherDataRef = useRef(null);
    const isScanningRef = useRef(false);
    const markedRef = useRef(new Set());

    useEffect(() => {
        teacherDataRef.current = teacherData;
    }, [teacherData]);

    useEffect(() => {
        isScanningRef.current = isScanning;
    }, [isScanning]);

    useEffect(() => {
        const init = async () => {
            try {
                setStatus('Loading models...');
                await loadModels();

                setStatus('Fetching your assigned class...');
                const result = await getTeacherDashboard();
                setTeacherData(result);

                // Re-fetch all students to filter if needed, but createFaceMatcher works best with full list
                // Or better, filter students of this class only for matching speed
                const allStudents = await getAllStudents();
                const classStudents = allStudents.filter(s => s.classId?._id === result.teacher.class._id);

                const matcher = createFaceMatcher(classStudents);
                setFaceMatcher(matcher);

                setStatus('Starting webcam...');
                startVideo();
                setLoading(false);
                setStatus('Ready to scan');
            } catch (error) {
                console.error(error);
                setStatus('Error initializing');
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
            .catch(err => {
                console.error(err);
                setStatus('Webcam access denied');
            });
    };

    const handleVideoPlay = () => {
        const interval = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current || !faceMatcher || !isScanningRef.current) {
                if (canvasRef.current) {
                    canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
                return;
            }

            const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
            faceapi.matchDimensions(canvasRef.current, displaySize);

            const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvasRef.current.getContext('2d').clearRect(0, 0, displaySize.width, displaySize.height);

            resizedDetections.forEach(async (detection) => {
                const result = faceMatcher.findBestMatch(detection.descriptor);
                const { label, distance } = result;
                const confidence = 1 - distance;

                const box = detection.detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, {
                    label: `${label === 'unknown' ? 'Unknown' : 'Marking...'} (${(confidence * 100).toFixed(1)}%)`
                });
                drawBox.draw(canvasRef.current);

                if (label !== 'unknown' && confidence > 0.6) {
                    setDetectionInfo({ name: label, confidence: (confidence * 100).toFixed(1) });
                    handleMarkAttendance(label);
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    };

    const startAttendance = () => {
        setPresentCount(0);
        markedRef.current = new Set();
        setIsScanning(true);
        setStatus(`Attendance Session Started: ${teacherData.teacher.subject.subjectName}`);
    };

    const finishAttendance = async () => {
        if (!window.confirm('Finish scanning and mark remaining students as Absent?')) return;

        setIsScanning(false);
        setStatus('Processing absentees...');

        try {
            const today = new Date().toISOString().split('T')[0];
            const result = await markAbsentees({
                date: today,
                subject: teacherData.teacher.subject.subjectName,
                classId: teacherData.teacher.class._id
            });

            setStatus(`Attendance Complete! Marked ${result.count} absentees.`);
            alert(`Attendance Finished!
Present: ${markedRef.current.size}
Absent: ${result.count}`);
        } catch (error) {
            console.error(error);
            setStatus('Error marking absentees');
        }
    };

    const handleMarkAttendance = async (studentId) => {
        const today = new Date().toISOString().split('T')[0];
        const subject = teacherDataRef.current.teacher.subject.subjectName;
        const key = `${studentId}-${today}-${subject}`;

        if (markedRef.current.has(key)) return;

        try {
            const time = new Date().toLocaleTimeString();
            await markAttendance({ studentId, date: today, time, subject });
            markedRef.current.add(key);
            setPresentCount(markedRef.current.size);
            setStatus(`Marked Present! (Total: ${markedRef.current.size})`);
        } catch (error) {
            if (error.response?.status === 400) {
                markedRef.current.add(key);
                setPresentCount(markedRef.current.size);
            }
        }
    };

    if (loading) return <Layout><div className="text-center mt-5">Loading face models and data...</div></Layout>;

    return (
        <Layout>
            <div className="mb-4">
                <h2 className="fw-bold mb-1">Face Recognition Attendance</h2>
                <p className="text-muted">Smart scanner for **{teacherData.teacher.subject.subjectName}**</p>
            </div>

            <div className="card shadow-sm border-0 mb-4 p-3 bg-white">
                <div className="row g-3 align-items-center">
                    <div className="col-md-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <small className="text-muted d-block">Assigned Subject</small>
                                <span className="fw-bold">{teacherData.teacher.subject.subjectName}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-info bg-opacity-10 p-2 rounded-3 text-info">
                                <GraduationCap size={20} />
                            </div>
                            <div>
                                <small className="text-muted d-block">Target Class</small>
                                <span className="fw-bold">{teacherData.teacher.class.className}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 d-flex justify-content-end gap-2">
                        {!isScanning ? (
                            <button className="btn btn-success px-4 d-flex align-items-center gap-2" onClick={startAttendance}>
                                <Play size={18} /> Start Scanner
                            </button>
                        ) : (
                            <button className="btn btn-danger px-4 d-flex align-items-center gap-2" onClick={finishAttendance}>
                                <Square size={18} /> Finish Session
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 bg-dark overflow-hidden position-relative rounded-4" style={{ minHeight: '480px' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            onPlay={handleVideoPlay}
                            className="w-100 h-auto"
                        />
                        <canvas
                            ref={canvasRef}
                            className="position-absolute top-0 left-0 w-100 h-100"
                        />
                        {!isScanning && (
                            <div className="position-absolute top-50 start-50 translate-middle text-white text-center bg-black bg-opacity-50 p-4 rounded-4 w-75">
                                <Camera size={48} className="mb-3 opacity-50" />
                                <h4>Scanner Paused</h4>
                                <p className="mb-0 text-white-50">Click "Start Scanner" to begin identifying students</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 d-flex justify-content-between align-items-center p-3 bg-white rounded-4 shadow-sm">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                                <Camera size={24} />
                            </div>
                            <div>
                                <div className="small text-muted fw-bold">Live Status</div>
                                <div className="fw-bold fs-5">{status}</div>
                            </div>
                        </div>
                        {isScanning && (
                            <div className="text-end">
                                <div className="small text-muted fw-bold">Scanned Students</div>
                                <div className="fw-bold fs-4 text-success">{presentCount} Identified</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 h-100 p-4 rounded-4">
                        <h5 className="mb-4">Verification</h5>
                        <div className="text-center py-5">
                            {detectionInfo.name && isScanning ? (
                                <>
                                    <div className="position-relative d-inline-block mb-4">
                                        <div className="rounded-circle border border-success border-4 p-2">
                                            <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                                                <CheckCircle size={64} className="text-success" />
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="mb-1">Student Found</h4>
                                    <p className="text-muted mb-0">Reg No: {detectionInfo.name}</p>
                                    <small className="text-success fw-bold">Success: {detectionInfo.confidence}% Match</small>
                                </>
                            ) : (
                                <div className="text-muted">
                                    <div className="spinner-border text-primary border-0 mb-4" style={{ width: '80px', height: '80px', borderWidth: '4px' }}>
                                        <RefreshCw size={40} className="position-absolute top-50 start-50 translate-middle" />
                                    </div>
                                    <p className="mb-0">Waiting for face...</p>
                                    <small>Position yourself in front of camera</small>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto border-top pt-4">
                            <h6 className="fw-bold mb-3">Scanner Guide:</h6>
                            <div className="d-flex flex-column gap-3 small text-muted">
                                <div className="d-flex gap-3">
                                    <div className="badge bg-primary rounded-circle p-2" style={{ width: '24px', height: '24px' }}>1</div>
                                    <span>Ensure adequate lighting for better face recognition.</span>
                                </div>
                                <div className="d-flex gap-3">
                                    <div className="badge bg-primary rounded-circle p-2" style={{ width: '24px', height: '24px' }}>2</div>
                                    <span>The scanner automatically marks attendance once verified.</span>
                                </div>
                                <div className="d-flex gap-3">
                                    <div className="badge bg-primary rounded-circle p-2" style={{ width: '24px', height: '24px' }}>3</div>
                                    <span>Finish to mark absentees for remaining students.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TeacherAttendanceScanner;
