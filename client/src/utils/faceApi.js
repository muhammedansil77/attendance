import * as faceapi from 'face-api.js';

export const loadModels = async () => {
    const MODEL_URL = '/models';
    console.log("Loading models from:", MODEL_URL);
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        console.log("ssdMobilenetv1 loaded");
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        console.log("faceLandmark68Net loaded");
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log("faceRecognitionNet loaded");
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        console.log("tinyFaceDetector loaded");
    } catch (err) {
        console.error("Error loading specific model:", err);
        throw err;
    }
};

export const getFaceDescriptor = async (imageElement) => {
    const detection = await faceapi.detectSingleFace(imageElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

    return detection ? Array.from(detection.descriptor) : null;
};

export const createFaceMatcher = (students) => {
    const labeledDescriptors = students.map(student => {
        if (!student.faceDescriptor || student.faceDescriptor.length === 0) return null;
        return new faceapi.LabeledFaceDescriptors(
            student._id,
            [new Float32Array(student.faceDescriptor)]
        );
    }).filter(Boolean);

    if (labeledDescriptors.length === 0) return null;
    return new faceapi.FaceMatcher(labeledDescriptors, 0.6); // 0.6 is confidence threshold
};
