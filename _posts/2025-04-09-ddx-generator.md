---
layout: post
title: "Differential Diagnosis Generator"
date: 2025-04-09
categories: medical tools
---

<div class="ddx-generator-container" style="border: 1px solid #ccc; padding: 10px; margin-top: 20px;">
    <iframe id="ddx-iframe" src="/portfolio/ddx-generator/" width="100%" style="border:none; overflow:hidden;" scrolling="no"></iframe>
</div>

<script>
    window.addEventListener('message', function(event) {
        // Optional: Check event.origin for security if the iframe source is external or untrusted
        // if (event.origin !== 'expected_origin') return;

        if (event.data && typeof event.data.frameHeight === 'number') {
            const iframe = document.getElementById('ddx-iframe');
            if (iframe) {
                // Add a small buffer (e.g., 20px) to prevent potential scrollbars due to rounding or borders
                iframe.style.height = (event.data.frameHeight + 20) + 'px';
            }
        }
    });
</script>
