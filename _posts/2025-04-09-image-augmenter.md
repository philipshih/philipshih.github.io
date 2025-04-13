---
layout: post # Or keep the default layout handling if 'post' isn't strictly needed for portfolio items
title: "Imaging Vision Sandbox"
date: 2023-11-15
type: Web app
info: "Applies augmentations and classifies images using TensorFlow (MobileNet) in-browser."
tech: "JavaScript, HTML Canvas, CSS, TensorFlow.js" # Updated tech
app_url: "/portfolio/vision-sandbox/index.html" # Keep for reference, but not used for linking anymore
---

The vision sandbox lets you upload an image, apply various augmentation techniques (contrast, noise, shear, etc.), crop the image, and see it classified in real-time using a pre-trained MobileNet model. 

Prediction accuracy is limited because requiring real-time inference on browsers imposes constraints on the models we can use. 

<div class="app-container" style="border: 1px solid #ccc; padding: 10px; margin-top: 20px; overflow: hidden;"> <!-- Removed min-height, resize, overflow:auto; Added overflow:hidden -->
    <iframe id="vision-iframe" src="/portfolio/vision-sandbox/index.html" width="100%" style="border:none; display: block;" scrolling="no"></iframe> <!-- Removed height, added id, scrolling=no, display:block -->
</div>

<script>
    window.addEventListener('message', function(event) {
        // Basic security check
        // if (event.origin !== window.location.origin) return;

        if (event.data && typeof event.data.frameHeight === 'number') {
            const iframe = document.getElementById('vision-iframe');
            if (iframe) {
                // Add a small buffer
                iframe.style.height = (event.data.frameHeight + 20) + 'px';
            }
        }
    });
</script>
