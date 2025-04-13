---
layout: post
title: "Differential Diagnosis Generator"
date: 2025-01-05 
type: Tool
info: "Generates differential diagnoses based on selected findings and symptom scoring system."
tech: "JavaScript, HTML, CSS"
app_url: "/portfolio/ddx-generator/index.html" # Keep for reference
---

<!-- Description removed, iframe added below -->
<div class="ddx-generator-container" style="border: 1px solid #ccc; padding: 10px; margin-top: 20px; overflow: hidden;">
    <iframe id="ddx-iframe" src="/portfolio/ddx-generator/index.html" width="100%" style="border:none; display: block;" scrolling="no"></iframe> <!-- Added ID, removed fixed height -->
</div>

<script>
    window.addEventListener('message', function(event) {
        // Basic security check
        // if (event.origin !== window.location.origin) return;

        if (event.data && typeof event.data.frameHeight === 'number') {
            const iframe = document.getElementById('ddx-iframe');
            if (iframe) {
                // Add a small buffer
                iframe.style.height = (event.data.frameHeight + 20) + 'px';
            }
        }
    });
</script>
