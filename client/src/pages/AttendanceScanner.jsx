import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import Layout from '../components/Layout';
import { getAllStudents } from '../services/studentService';
import { markAttendance, markAbsentees } from '../services/attendanceService';
import { getAllSubjects } from '../services/subjectService';
import { getAllClasses } from '../services/classService';
import { loadModels, createFaceMatcher } from '../utils/faceApi';
import { Camera, RefreshCw, Play, Square, CheckCircle } from 'lucide-react';

const AttendanceScanner = () => {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [loading, setLoading] = useState(true);
    const [faceMatcher, setFaceMatcher] = useState(null);
    const [status, setStatus] = useState('Initializing...');
    const [detectionInfo, setDetectionInfo] = useState({ name: '', confidence: 0 });
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [presentCount, setPresentCount] = useState(0);

    const selectedSubjectRef = useRef('');
    const isScanningRef = useRef(false);
    const markedRef = useRef(new Set()); // To prevent multiple marking in one session

    useEffect(() => {
        selectedSubjectRef.current = selectedSubject;
    }, [selectedSubject]);

    useEffect(() => {
        isScanningRef.current = isScanning;
    }, [isScanning]);

    useEffect(() => {
        const init = async () => {
            try {
                setStatus('Loading models...');
                await loadModels();

                setStatus('Fetching records...');
                const [students, subjectData, classData] = await Promise.all([
                    getAllStudents(),
                    getAllSubjects(),
                    getAllClasses()
                ]);

                const matcher = createFaceMatcher(students);
                setFaceMatcher(matcher);
                setSubjects(subjectData);
                setClasses(classData);

                if (subjectData.length > 0) setSelectedSubject(subjectData[0].subjectName);
                if (classData.length > 0) setSelectedClass(classData[0]._id);

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

                // Draw detection box
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

    const toggleAttendance = () => {
        if (!selectedSubject) {
            alert('Please select a subject first');
            return;
        }
        if (!selectedClass) {
            alert('Please select a class first');
            return;
        }

        if (isScanning) {
            // Stopping attendance logic handled by finish button
        } else {
            setPresentCount(0);
            markedRef.current = new Set();
            setIsScanning(true);
            setStatus(`Attendance Session Started: ${selectedSubject}`);
        }
    };

    const finishAttendance = async () => {
        if (!window.confirm('Finish scanning and mark remaining students as Absent?')) return;

        setIsScanning(false);
        setStatus('Processing absentees...');

        try {
            const today = new Date().toISOString().split('T')[0];
            const result = await markAbsentees({
                date: today,
                subject: selectedSubject,
                classId: selectedClass
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
        const currentSubject = selectedSubjectRef.current;
        const today = new Date().toISOString().split('T')[0];
        const key = `${studentId}-${today}-${currentSubject}`;

        if (markedRef.current.has(key)) return;

        try {
            const time = new Date().toLocaleTimeString();
            await markAttendance({ studentId, date: today, time, subject: currentSubject });
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

    return (
        <Layout>
            <div className="card shadow-sm border-0 mb-4 p-3 bg-white">
                <div className="row g-3 align-items-center">
                    <div className="col-md-3">
                        <label className="small fw-bold text-muted mb-1">Select Subject</label>
                        <select
                            className="form-select"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={isScanning}
                        >
                            <option value="">Choose Subject...</option>
                            {subjects.map(sub => (
                                <option key={sub._id} value={sub.subjectName}>{sub.subjectName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="small fw-bold text-muted mb-1">Select Class</label>
                        <select
                            className="form-select"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            disabled={isScanning}
                        >
                            <option value="">Choose Class...</option>
                            {classes.map(c => (
                                <option key={c._id} value={c._id}>{c.className}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6 d-flex justify-content-end gap-2">
                        {!isScanning ? (
                            <button className="btn btn-success px-4 d-flex align-items-center gap-2" onClick={toggleAttendance}>
                                <Play size={18} /> Start Attendance
                            </button>
                        ) : (
                            <button className="btn btn-danger px-4 d-flex align-items-center gap-2" onClick={finishAttendance}>
                                <Square size={18} /> Finish & Mark Absentees
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
                                <p className="mb-0 text-white-50">Select subject/class and click "Start Attendance" to begin</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 d-flex justify-content-between align-items-center p-3 bg-white rounded-4 shadow-sm">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                                <Camera size={24} />
                            </div>
                            <div>
                                <div className="small text-muted fw-bold">Current Status</div>
                                <div className="fw-bold fs-5">{status}</div>
                            </div>
                        </div>
                        {isScanning && (
                            <div className="text-end">
                                <div className="small text-muted fw-bold">Live Count</div>
                                <div className="fw-bold fs-4 text-success">{presentCount} Present</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 h-100 p-4 rounded-4">
                        <h5 className="mb-4">Live Detection</h5>
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
                                    <h4 className="mb-1">Verified</h4>
                                    <p className="text-muted mb-0">ID: {detectionInfo.name}</p>
                                </>
                            ) : (
                                <div className="text-muted">
                                    <div className="spinner-border text-primary border-0 mb-4" style={{ width: '80px', height: '80px', borderWidth: '4px' }}>
                                        <RefreshCw size={40} className="position-absolute top-50 start-50 translate-middle" />
                                    </div>
                                    <p className="mb-0">Waiting for detection...</p>
                                    <small>Scanning only active during sessions</small>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto border-top pt-4">
                            <h6 className="fw-bold mb-3">Attendance Workflow:</h6>
                            <div className="d-flex flex-column gap-3 small text-muted">
                                <div className="d-flex gap-3">
                                    <div className="badge bg-primary rounded-circle p-2" style={{ width: '24px', height: '24px' }}>1</div>
                                    <span>Select the **Subject** and **Class** from the top bar.</span>
                                </div>
                                <div className="d-flex gap-3">
                                    <div className="badge bg-primary rounded-circle p-2" style={{ width: '24px', height: '24px' }}>2</div>
                                    <span>Click **Start Attendance** to enable real-time face scanning.</span>
                                </div>
                                <div className="d-flex gap-3">
                                    <div className="badge bg-primary rounded-circle p-2" style={{ width: '24px', height: '24px' }}>3</div>
                                    <span>Click **Finish** to close the session and mark everyone else as **Absent**.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AttendanceScanner;
