const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');
const imageUpload = document.getElementById('image-upload');
const loadingMessage = document.getElementById('loading-message');
const classificationResultDiv = document.getElementById('classification-result');

// Control elements
const rotationSlider = document.getElementById('rotation');
const scaleSlider = document.getElementById('scale');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const noiseSlider = document.getElementById('noise');
const blurSlider = document.getElementById('blur');
const shearSlider = document.getElementById('shear');
const resetButton = document.getElementById('reset-button');

// Value display elements
const rotationValueSpan = document.getElementById('rotation-value');
const scaleValueSpan = document.getElementById('scale-value');
const brightnessValueSpan = document.getElementById('brightness-value');
const contrastValueSpan = document.getElementById('contrast-value');
const noiseValueSpan = document.getElementById('noise-value');
const blurValueSpan = document.getElementById('blur-value');
const shearValueSpan = document.getElementById('shear-value');

let originalImage = null;
let imageLoaded = false;
let mobilenetModel = null; // Variable to hold the loaded model
// Use the user-provided image path
const defaultImageSrc = '../../assets/img/Skin_rashes.jpg'; // Updated default image

// --- ML Model Loading ---
async function loadModel() {
    console.log('Loading MobileNet model...');
    classificationResultDiv.innerHTML = '<p>Loading classification model...</p>';
    try {
        mobilenetModel = await mobilenet.load();
        console.log('MobileNet model loaded successfully.');
        classificationResultDiv.innerHTML = '<p>Model loaded. Ready to classify.</p>';
        // Classify the initial image once the model is loaded
        if (imageLoaded) {
            classifyImage();
        }
    } catch (error) {
        console.error('Error loading MobileNet model:', error);
        classificationResultDiv.innerHTML = '<p>Error loading classification model.</p>';
    }
}

// --- Image Loading ---
function loadImage(src) {
    loadingMessage.style.display = 'block';
    canvas.style.display = 'none';
    originalImage = new Image();
    originalImage.crossOrigin = "Anonymous"; // Allow processing if image is from another domain (e.g., placeholder)
    originalImage.onload = () => {
        imageLoaded = true;
        loadingMessage.style.display = 'none';
        canvas.style.display = 'block';
        // Set canvas size to match image initially
        canvas.width = originalImage.naturalWidth;
        canvas.height = originalImage.naturalHeight;
        resetControls(); // Reset sliders when new image loads
        drawImage(); // Draw the image first
        // Classify the newly loaded image if model is ready
        if (mobilenetModel) {
             classifyImage();
        } else {
            classificationResultDiv.innerHTML = '<p>Waiting for model to load...</p>';
        }
    };
    originalImage.onerror = () => {
        loadingMessage.innerText = 'Error loading default image. Please check path or upload one.';
        console.error("Error loading image:", src);
        imageLoaded = false;
        originalImage = null; // Clear image object on error
    };
    originalImage.src = src;
}

imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            loadImage(e.target.result);
        }
        reader.readAsDataURL(file);
    }
});

// --- Drawing Logic ---
function drawImage() {
    if (!imageLoaded || !originalImage) return;

    // Get current control values
    const rotation = parseFloat(rotationSlider.value);
    const scale = parseFloat(scaleSlider.value);
    const brightness = parseFloat(brightnessSlider.value);
    const contrast = parseFloat(contrastSlider.value);
    const noise = parseInt(noiseSlider.value);
    const blur = parseFloat(blurSlider.value);
    const shear = parseFloat(shearSlider.value);

    // Update value displays
    rotationValueSpan.textContent = rotation;
    scaleValueSpan.textContent = scale.toFixed(2);
    brightnessValueSpan.textContent = brightness;
    contrastValueSpan.textContent = contrast;
    noiseValueSpan.textContent = noise;
    blurValueSpan.textContent = blur.toFixed(1);
    shearValueSpan.textContent = shear.toFixed(2);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations (order matters!)
    // 1. Translate to center for rotation/scaling
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // 2. Rotate
    ctx.rotate(rotation * Math.PI / 180);
    // 3. Scale
    ctx.scale(scale, scale);
    // 4. Translate back (relative to original image center)
    ctx.translate(-originalImage.naturalWidth / 2, -originalImage.naturalHeight / 2);

    // Apply filters (brightness, contrast, blur)
    // Note: Order might matter depending on desired effect. Blur is applied last here.
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) blur(${blur}px)`;

    // Apply shear transformation *just before* drawing the image within the transformed context
    ctx.transform(1, 0, shear, 1, 0, 0); // Apply shear matrix (horizontal)

    // Draw the original image
    ctx.drawImage(originalImage, 0, 0, originalImage.naturalWidth, originalImage.naturalHeight);

    // Restore context to remove filters/transforms for next draw operations (like noise)
    ctx.restore(); // This removes filters AND transforms (rotate, scale, shear)

    // Apply noise (if any) - applied after other transforms/filters
    if (noise > 0) {
        applyNoise(noise);
    }

    // Classify the image after drawing/augmenting if model is loaded
    if (mobilenetModel) {
        classifyImage();
    }
}

// --- Image Classification ---
async function classifyImage() {
    if (!mobilenetModel || !imageLoaded || !canvas) {
        console.log("Model or image not ready for classification.");
        return;
    }
    classificationResultDiv.innerHTML = '<p>Classifying...</p>';

    try {
        // Get the current image data from the canvas
        // Note: Using the canvas directly works with MobileNet
        const predictions = await mobilenetModel.classify(canvas);

        if (predictions && predictions.length > 0) {
            const topPrediction = predictions[0];
            const className = topPrediction.className.split(',')[0]; // Get primary class name
            const probability = (topPrediction.probability * 100).toFixed(1);
            classificationResultDiv.innerHTML = `<p>Identified as: <strong>${className}</strong> (${probability}%)</p>`;
            console.log('Classification results:', predictions);
        } else {
            classificationResultDiv.innerHTML = '<p>Could not classify image.</p>';
        }
    } catch (error) {
        console.error('Error during classification:', error);
        classificationResultDiv.innerHTML = '<p>Error during classification.</p>';
    }
}


// --- Noise Application ---
function applyNoise(amount) {
    if (!imageLoaded) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const noiseFactor = amount * 2.55; // Scale noise amount

    for (let i = 0; i < data.length; i += 4) {
        const randomNoise = (Math.random() - 0.5) * noiseFactor;
        data[i] = Math.max(0, Math.min(255, data[i] + randomNoise));     // Red
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + randomNoise)); // Green
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + randomNoise)); // Blue
        // Alpha (data[i + 3]) remains unchanged
    }
    ctx.putImageData(imageData, 0, 0);
}


// --- Event Listeners for Controls ---
rotationSlider.addEventListener('input', drawImage);
scaleSlider.addEventListener('input', drawImage);
brightnessSlider.addEventListener('input', drawImage);
contrastSlider.addEventListener('input', drawImage);
noiseSlider.addEventListener('input', drawImage);
blurSlider.addEventListener('input', drawImage);
shearSlider.addEventListener('input', drawImage);

// --- Reset Functionality ---
function resetControls() {
    rotationSlider.value = 0;
    scaleSlider.value = 1.0;
    brightnessSlider.value = 100;
    contrastSlider.value = 100;
    noiseSlider.value = 0;
    blurSlider.value = 0;
    shearSlider.value = 0;
    drawImage(); // Redraw with default values
}

resetButton.addEventListener('click', resetControls);

// --- Initial Load ---
// Load the ML model first
loadModel();
// Then load the default image
loadImage(defaultImageSrc);
