const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');
const imageUpload = document.getElementById('image-upload');
const loadingMessage = document.getElementById('loading-message');
const classificationResultDiv = document.getElementById('classification-result');
const resolutionValueSpan = document.getElementById('resolution-value');
const filetypeValueSpan = document.getElementById('filetype-value');

// Control elements
const rotationSlider = document.getElementById('rotation');
const scaleSlider = document.getElementById('scale');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const noiseSlider = document.getElementById('noise');
const blurSlider = document.getElementById('blur');
const shearSlider = document.getElementById('shear');
const cropButton = document.getElementById('crop-button');
const resetButton = document.getElementById('reset-button');

// Value display elements
const rotationValueSpan = document.getElementById('rotation-value');
const scaleValueSpan = document.getElementById('scale-value');
const brightnessValueSpan = document.getElementById('brightness-value');
const contrastValueSpan = document.getElementById('contrast-value');
const noiseValueSpan = document.getElementById('noise-value');
const blurValueSpan = document.getElementById('blur-value');
const shearValueSpan = document.getElementById('shear-value');

let originalImage = null; // Holds the *current* base image (could be original or cropped)
let sourceImage = null; // Always holds the initially loaded image before any crops
let currentImageType = 'jpeg'; // Default assumption for initial image
let imageLoaded = false;
let mobilenetModel = null; // Variable to hold the loaded model

// Crop state variables
let isSelecting = false;
let cropStartX, cropStartY, cropEndX, cropEndY;
let selectionRectDiv = null; // Will create this div dynamically

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
        // Store the initially loaded image separately
        if (!sourceImage) {
             sourceImage = new Image();
             sourceImage.crossOrigin = "Anonymous";
             sourceImage.src = src; // Keep a copy of the original source
        }
        canvas.width = originalImage.naturalWidth;
        canvas.height = originalImage.naturalHeight;
        // Update image details display
        resolutionValueSpan.textContent = `${originalImage.naturalWidth} x ${originalImage.naturalHeight}`;
        filetypeValueSpan.textContent = currentImageType.toUpperCase(); // Use stored type

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
        sourceImage = null; // Reset source image on new upload
        currentImageType = file.type.split('/')[1] || 'unknown'; // Store file type
        const reader = new FileReader();
        reader.onload = (e) => {
            loadImage(e.target.result); // Load image from data URL
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

    // Add watermark AFTER all other drawing and BEFORE classification
    addWatermark();

    // Classify the image after drawing/augmenting if model is loaded
    if (mobilenetModel) {
        classifyImage();
    }
}

// --- Watermark ---
function addWatermark() {
    ctx.save(); // Save context state before applying watermark styles
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Semi-transparent white
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('© Philip Shih 2025', canvas.width - 5, canvas.height - 5);
    ctx.restore(); // Restore context state
}

// --- Cropping Logic ---

function initializeCropSelection() {
    if (!selectionRectDiv) {
        selectionRectDiv = document.createElement('div');
        selectionRectDiv.id = 'selection-rect';
        // Append to the same container as the canvas for correct positioning
        canvas.parentNode.appendChild(selectionRectDiv);
    }

    canvas.addEventListener('mousedown', startSelection);
    canvas.addEventListener('mousemove', updateSelection);
    canvas.addEventListener('mouseup', endSelection);
    canvas.addEventListener('mouseleave', endSelection); // Stop if mouse leaves canvas
}

function startSelection(e) {
    if (!imageLoaded) return;
    isSelecting = true;
    const rect = canvas.getBoundingClientRect();
    cropStartX = e.clientX - rect.left;
    cropStartY = e.clientY - rect.top;
    cropEndX = cropStartX; // Initialize end points
    cropEndY = cropStartY;

    selectionRectDiv.style.left = `${cropStartX}px`;
    selectionRectDiv.style.top = `${cropStartY}px`;
    selectionRectDiv.style.width = '0px';
    selectionRectDiv.style.height = '0px';
    selectionRectDiv.style.display = 'block'; // Show selection rectangle
}

function updateSelection(e) {
    if (!isSelecting || !imageLoaded) return;
    const rect = canvas.getBoundingClientRect();
    cropEndX = e.clientX - rect.left;
    cropEndY = e.clientY - rect.top;

    // Ensure coordinates stay within canvas bounds
    cropEndX = Math.max(0, Math.min(canvas.width, cropEndX));
    cropEndY = Math.max(0, Math.min(canvas.height, cropEndY));

    const width = Math.abs(cropEndX - cropStartX);
    const height = Math.abs(cropEndY - cropStartY);
    const left = Math.min(cropStartX, cropEndX);
    const top = Math.min(cropStartY, cropEndY);

    selectionRectDiv.style.left = `${left}px`;
    selectionRectDiv.style.top = `${top}px`;
    selectionRectDiv.style.width = `${width}px`;
    selectionRectDiv.style.height = `${height}px`;
}

function endSelection() {
    if (!isSelecting) return;
    isSelecting = false;
    // Optional: Snap selection to bounds slightly? Or just keep it as is.
    // If width or height is very small, maybe cancel selection?
    const width = Math.abs(cropEndX - cropStartX);
    const height = Math.abs(cropEndY - cropStartY);
    if (width < 5 || height < 5) { // Minimal size check
        selectionRectDiv.style.display = 'none'; // Hide if too small
    }
}

function applyCrop() {
    if (!imageLoaded || selectionRectDiv.style.display === 'none') {
        alert("Please select an area on the image to crop first.");
        return;
    }

    const sx = Math.min(cropStartX, cropEndX);
    const sy = Math.min(cropStartY, cropEndY);
    const sWidth = Math.abs(cropEndX - cropStartX);
    const sHeight = Math.abs(cropEndY - cropStartY);

    if (sWidth < 5 || sHeight < 5) {
         alert("Selection is too small to crop.");
         selectionRectDiv.style.display = 'none';
         return;
    }

    // Create a temporary canvas to draw the *original* image at its natural size
    // We crop from the sourceImage to avoid re-cropping an already cropped image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const imgToCrop = sourceImage || originalImage; // Prefer the initial source if available

    tempCanvas.width = imgToCrop.naturalWidth;
    tempCanvas.height = imgToCrop.naturalHeight;
    tempCtx.drawImage(imgToCrop, 0, 0);

    // Calculate crop coordinates relative to the natural image size
    // (assuming canvas display size matches natural size for simplicity here,
    // might need adjustment if canvas is scaled via CSS)
    const naturalSx = sx * (imgToCrop.naturalWidth / canvas.width);
    const naturalSy = sy * (imgToCrop.naturalHeight / canvas.height);
    const naturalSWidth = sWidth * (imgToCrop.naturalWidth / canvas.width);
    const naturalSHeight = Math.round(sHeight * (imgToCrop.naturalHeight / canvas.height)); // Use Math.round for integer dimensions


    try {
        // Get the image data for the selected region from the temp canvas
        // Ensure calculated dimensions don't exceed the source image bounds slightly due to rounding
        const safeSWidth = Math.min(naturalSWidth, imgToCrop.naturalWidth - naturalSx);
        const safeSHeight = Math.min(naturalSHeight, imgToCrop.naturalHeight - naturalSy);

        if (safeSWidth <= 0 || safeSHeight <= 0) {
            throw new Error("Calculated crop dimensions are invalid.");
        }

        const croppedImageData = tempCtx.getImageData(naturalSx, naturalSy, safeSWidth, safeSHeight);

        // Create another temporary canvas to hold just the cropped data
        const cropOutputCanvas = document.createElement('canvas');
        cropOutputCanvas.width = safeSWidth; // Use safe dimensions
        cropOutputCanvas.height = safeSHeight;
        const cropOutputCtx = cropOutputCanvas.getContext('2d');
        cropOutputCtx.putImageData(croppedImageData, 0, 0);

        // Create a new Image object from the cropped canvas data URL
        const dataUrl = cropOutputCanvas.toDataURL(`image/${currentImageType}`);

        // Update the main originalImage source to the new data URL
        // This effectively replaces the current image with the cropped version
        // We also need to update the sourceImage if we want subsequent crops
        // to be based on the *first* crop, not the original. Let's keep sourceImage as original.
        originalImage = new Image(); // Create a new image object for the cropped version
        originalImage.crossOrigin = "Anonymous";
        originalImage.onload = () => {
            // Update canvas size and details for the newly cropped image
            canvas.width = originalImage.naturalWidth;
            canvas.height = originalImage.naturalHeight;
            resolutionValueSpan.textContent = `${originalImage.naturalWidth} x ${originalImage.naturalHeight}`;
            filetypeValueSpan.textContent = currentImageType.toUpperCase() + " (Cropped)";

            // Reset augmentations and redraw with the cropped image
            // We don't call resetControls() fully as that would revert to sourceImage
            // Just reset sliders and redraw
            rotationSlider.value = 0;
            scaleSlider.value = 1.0;
            brightnessSlider.value = 100;
            contrastSlider.value = 100;
            noiseSlider.value = 0;
            blurSlider.value = 0;
            shearSlider.value = 0;
            drawImage(); // Redraw with the new cropped image and default augmentations
            // Explicitly classify the newly cropped and drawn image
            if (mobilenetModel) {
                classifyImage();
            }
        };
         originalImage.onerror = () => {
             console.error("Error loading cropped image data URL.");
             alert("Failed to load cropped image.");
             // Revert to previous state if loading fails? Maybe revert to sourceImage.
             originalImage = sourceImage; // Revert
             resetControls(); // Full reset if crop load fails
        }
        originalImage.src = dataUrl; // Load the cropped image data

    } catch (error) {
        console.error("Error during cropping:", error);
        alert("An error occurred while cropping the image. The selection might be outside the image bounds.");
    } finally {
         // Hide selection rectangle
         selectionRectDiv.style.display = 'none';
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
cropButton.addEventListener('click', applyCrop);

// --- Reset Functionality ---
function resetControls() {
    // Reset sliders
    rotationSlider.value = 0;
    scaleSlider.value = 1.0;
    brightnessSlider.value = 100;
    contrastSlider.value = 100;
    noiseSlider.value = 0;
    blurSlider.value = 0;
    shearSlider.value = 0;

    // Reset crop selection visual
    if (selectionRectDiv) {
        selectionRectDiv.style.display = 'none';
    }
    isSelecting = false; // Ensure selection state is reset

    // If we have the original source image, reset to that
    if (sourceImage && originalImage !== sourceImage) {
        originalImage = sourceImage; // Revert to the very first image loaded
        canvas.width = originalImage.naturalWidth;
        canvas.height = originalImage.naturalHeight;
        resolutionValueSpan.textContent = `${originalImage.naturalWidth} x ${originalImage.naturalHeight}`;
        filetypeValueSpan.textContent = currentImageType.toUpperCase(); // Revert type display
        console.log("Reverted to original source image.");
    }


    drawImage(); // Redraw with default values/original image
}

resetButton.addEventListener('click', resetControls);

// --- Initial Load ---
initializeCropSelection(); // Set up mouse listeners for cropping
// Load the ML model first
loadModel();
// Then load the default image
loadImage(defaultImageSrc);

// --- Iframe Height Communication ---
function sendHeightToParent() {
    // Use scrollHeight for the body to get the full content height
    const height = document.body.scrollHeight;
    // Send message to parent window (the Jekyll post page)
    window.parent.postMessage({ frameHeight: height }, '*');
}

// Send height initially and whenever the window is resized
window.addEventListener('load', sendHeightToParent);
window.addEventListener('resize', sendHeightToParent);

// Also send after potentially height-changing operations
// Hook into loadImage and applyCrop completion (within their onload/finally blocks)
// and resetControls
const originalLoadImageOnload = originalImage.onload;
originalImage.onload = function() {
    if (originalLoadImageOnload) originalLoadImageOnload.apply(this, arguments);
    setTimeout(sendHeightToParent, 100); // Delay after image load/redraw
};

const originalApplyCrop = applyCrop;
applyCrop = function() {
    originalApplyCrop.apply(this, arguments);
    // The actual redraw happens in the new image's onload, so height is sent there.
    // If crop fails and reverts, resetControls is called, which also sends height.
};

const originalResetControls = resetControls;
resetControls = function() {
    originalResetControls.apply(this, arguments);
    setTimeout(sendHeightToParent, 100); // Delay after reset/redraw
};
