const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');
const imageUpload = document.getElementById('image-upload');
const loadingMessage = document.getElementById('loading-message');

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
// Attempt to find a suitable default image path relative to the correct project structure
// Assuming 'assets/img/' exists at the root of 'C:\Users\phili\OneDrive\Desktop\philipshih.github.io\'
const defaultImageSrc = '../../assets/img/profile.jpg'; // Adjusted relative path

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
        drawImage();
    };
    originalImage.onerror = () => {
        // Try a different potential default if the first fails
        const fallbackImageSrc = '../../assets/img/profile3.jpg'; // Try another common profile image
        if (src !== fallbackImageSrc) {
            console.warn("Failed to load default image:", src, "Trying fallback:", fallbackImageSrc);
            loadImage(fallbackImageSrc);
        } else {
            loadingMessage.innerText = 'Error loading default image. Please upload one.';
            console.error("Error loading image:", src, "and fallback failed.");
            imageLoaded = false;
            originalImage = null; // Clear image object on error
        }
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
// Load a default image on page load
loadImage(defaultImageSrc);
