---
layout: post
title: "Snake"
date: 2022-08-20
type: Web Game
info: "Play snake with me by logging your score."
tech: "JavaScript, HTML Canvas, CSS, Firebase" # Updated tech
app_url: "/portfolio/snake-game/index.html" # Keep for reference, but not used for linking anymore
---

Play snake with me by logging your score below. Use the arrow keys to control the snake.

<div class="app-container" style="border: 1px solid #ccc; padding: 10px; margin-top: 20px; overflow: hidden;">
    <iframe id="snake-iframe" src="/portfolio/snake-game/index.html" width="100%" height="650px" style="border:none; display: block;" scrolling="no"></iframe> <!-- Reverted height to 650px -->
</div>

<script>
    window.addEventListener('message', function(event) {
        // Basic security check
        // if (event.origin !== window.location.origin) return;

        if (event.data && typeof event.data.frameHeight === 'number') {
            const iframe = document.getElementById('snake-iframe');
            if (iframe) {
                // Add a small buffer
                iframe.style.height = (event.data.frameHeight + 20) + 'px';
            }
        }
    });
</script>
