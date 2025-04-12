const canvas = document.getElementById('bstCanvas');
const ctx = canvas.getContext('2d');
const nodeValueInput = document.getElementById('nodeValue');
const insertBtn = document.getElementById('insertBtn');
const searchBtn = document.getElementById('searchBtn');
const deleteBtn = document.getElementById('deleteBtn'); // Placeholder for future
const resetBtn = document.getElementById('resetBtn');
const messageEl = document.getElementById('message');

const NODE_RADIUS = 20;
const HORIZONTAL_SPACING = 40;
const VERTICAL_SPACING = 60;

class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = 0; // Position for drawing
        this.y = 0;
        this.color = 'lightblue'; // For highlighting during search
    }
}

let root = null;

// --- BST Operations ---

function insert(value) {
    const newNode = new Node(value);
    if (root === null) {
        root = newNode;
        setMessage(`Inserted ${value} as root.`);
    } else {
        insertNode(root, newNode);
    }
    drawTree();
}

function insertNode(node, newNode) {
    if (newNode.value < node.value) {
        if (node.left === null) {
            node.left = newNode;
            setMessage(`Inserted ${newNode.value} to the left of ${node.value}.`);
        } else {
            insertNode(node.left, newNode);
        }
    } else if (newNode.value > node.value) {
        if (node.right === null) {
            node.right = newNode;
            setMessage(`Inserted ${newNode.value} to the right of ${node.value}.`);
        } else {
            insertNode(node.right, newNode);
        }
    } else {
        setMessage(`${value} already exists in the tree.`);
        // Value already exists, do nothing or handle as needed
    }
}

async function search(value) {
    resetNodeColors(root); // Reset colors before search
    drawTree(); // Redraw with default colors
    setMessage(`Searching for ${value}...`);
    await searchNode(root, value);
    // Redraw one last time to ensure final state is shown
    drawTree();
}

async function searchNode(node, value) {
    if (node === null) {
        setMessage(`${value} not found in the tree.`);
        return false;
    }

    // Highlight current node
    node.color = 'yellow';
    drawTree();
    await sleep(500); // Pause for visualization

    if (value === node.value) {
        node.color = 'lightgreen'; // Found!
        setMessage(`${value} found!`);
        drawTree(); // Show final found color
        await sleep(1000); // Pause on found node
        resetNodeColors(root); // Reset after pause
        return true;
    } else if (value < node.value) {
        node.color = 'lightblue'; // Reset current node color before moving left
        drawTree();
        return await searchNode(node.left, value);
    } else {
        node.color = 'lightblue'; // Reset current node color before moving right
        drawTree();
        return await searchNode(node.right, value);
    }
}

function resetNodeColors(node) {
    if (node !== null) {
        node.color = 'lightblue';
        resetNodeColors(node.left);
        resetNodeColors(node.right);
    }
}

// --- Drawing Logic ---

function drawTree() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (root !== null) {
        // Calculate positions before drawing
        calculatePositions(root, canvas.width / 2, 50, canvas.width / 4);
        drawNode(root);
    }
}

function calculatePositions(node, x, y, horizontalOffset) {
    if (node === null) return;

    node.x = x;
    node.y = y;

    // Reduce horizontal offset for deeper levels
    const nextHorizontalOffset = horizontalOffset / 1.8; // Adjust this factor for spacing

    if (node.left !== null) {
        calculatePositions(node.left, x - horizontalOffset, y + VERTICAL_SPACING, nextHorizontalOffset);
    }
    if (node.right !== null) {
        calculatePositions(node.right, x + horizontalOffset, y + VERTICAL_SPACING, nextHorizontalOffset);
    }
}


function drawNode(node) {
    if (node === null) return;

    // Draw lines to children first (so nodes are drawn on top)
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    if (node.left !== null) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node.left.x, node.left.y);
        ctx.stroke();
        drawNode(node.left);
    }
    if (node.right !== null) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node.right.x, node.right.y);
        ctx.stroke();
        drawNode(node.right);
    }

    // Draw the node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = node.color; // Use node's color property
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw the node value
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value, node.x, node.y);
}

// --- Utility Functions ---
function setMessage(msg) {
    messageEl.textContent = msg;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Event Listeners ---
insertBtn.addEventListener('click', () => {
    const value = parseInt(nodeValueInput.value);
    if (!isNaN(value)) {
        insert(value);
        nodeValueInput.value = '';
    } else {
        setMessage("Please enter a valid number.");
    }
});

searchBtn.addEventListener('click', async () => {
    const value = parseInt(nodeValueInput.value);
     if (!isNaN(value)) {
        await search(value); // Make search async
        nodeValueInput.value = '';
    } else {
        setMessage("Please enter a valid number to search.");
    }
});

deleteBtn.addEventListener('click', () => {
    // Placeholder for delete functionality
    setMessage("Delete functionality not yet implemented.");
});

resetBtn.addEventListener('click', () => {
    root = null;
    drawTree();
    setMessage("Tree reset. Enter a number to start.");
});

// --- Initial Draw ---
drawTree(); // Draw empty canvas initially
