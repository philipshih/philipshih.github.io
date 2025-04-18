---
layout: post
title: "Binary Search Tree Visualizer"
date: 2024-05-10
type: Tool
info: "Visualize BST operations (insert, search, traversals, etc.) without the annoying lag on other sites."
tech: "JavaScript, HTML Canvas, CSS" # Updated tech
app_url: "/portfolio/bst-visualizer/index.html" # Keep for reference, but not used for linking anymore
---

 You can begin by selecting "Random Tree" to preview the visualization. 
 
 Enter numeric values to insert nodes into the tree. Use the search function to see the traversal path highlight nodes. 

<div class="app-container" style="border: 1px solid #ccc; padding: 10px; margin-top: 20px;">
    <iframe id="bst-iframe" src="/portfolio/bst-visualizer/index.html" width="100%" height="700px" style="border:none; display: block;"></iframe> <!-- Added ID back -->
</div>

<script>
    window.addEventListener('message', function(event) {
        // Basic security check
        // if (event.origin !== window.location.origin) return;

        if (event.data && typeof event.data.frameHeight === 'number') {
            const iframe = document.getElementById('bst-iframe');
            if (iframe) {
                // Set height based on message from iframe
                iframe.style.height = (event.data.frameHeight) + 'px'; // Use height directly
            }
        }
    });
</script>
