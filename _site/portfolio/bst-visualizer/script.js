// --- DOM Elements ---
const canvas = document.getElementById('bstCanvas');
const ctx = canvas.getContext('2d');
const nodeValueInput = document.getElementById('nodeValue');
const insertBtn = document.getElementById('insertBtn');
const searchBtn = document.getElementById('searchBtn');
const deleteBtn = document.getElementById('deleteBtn');
const bulkValuesInput = document.getElementById('bulkValues');
const bulkInsertBtn = document.getElementById('bulkInsertBtn');
const randomCountInput = document.getElementById('randomCount');
const randomTreeBtn = document.getElementById('randomTreeBtn');
const clearTreeBtn = document.getElementById('clearTreeBtn');
const messageEl = document.getElementById('message');
const treeHeightEl = document.getElementById('treeHeight');
const nodeCountEl = document.getElementById('nodeCount');
const balancedStatusEl = document.getElementById('balancedStatus');
const inOrderBtn = document.getElementById('inOrderBtn');
const preOrderBtn = document.getElementById('preOrderBtn');
const postOrderBtn = document.getElementById('postOrderBtn');
const levelOrderBtn = document.getElementById('levelOrderBtn');
const findMinBtn = document.getElementById('findMinBtn');
const findMaxBtn = document.getElementById('findMaxBtn');
const successorPredecessorValueInput = document.getElementById('successorPredecessorValue');
const findSuccessorBtn = document.getElementById('findSuccessorBtn');
const findPredecessorBtn = document.getElementById('findPredecessorBtn');
const stepControlsDiv = document.getElementById('stepControls');
const stepNextBtn = document.getElementById('stepNextBtn');
const stepPauseResumeBtn = document.getElementById('stepPauseResumeBtn');
const stepRunBtn = document.getElementById('stepRunBtn');
const stepCancelBtn = document.getElementById('stepCancelBtn');
const speedControl = document.getElementById('speedControl');
const bstModeRadio = document.getElementById('bstMode');
const avlModeRadio = document.getElementById('avlMode');
const treeModeRadios = document.querySelectorAll('input[name="treeMode"]');
const resetViewBtn = document.getElementById('resetViewBtn'); // New Reset View Button

// --- Constants ---
const NODE_RADIUS = 20;
const HORIZONTAL_SPACING = 40;
const VERTICAL_SPACING = 60;
const ZOOM_SENSITIVITY = 0.001;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5.0;
const DRAG_THRESHOLD = 5;

// --- Node Class ---
class Node { constructor(v){this.value=v;this.left=null;this.right=null;this.height=1;this.x=0;this.y=0;this.color='lightblue';} }

// --- Global State ---
let root = null;
let lastActionMessage = "Select Tree Type. Enter value & click Insert, or generate Random Tree.";
let currentlyHoveredNode = null;
let currentTreeMode = document.querySelector('input[name="treeMode"]:checked').value;

// --- Visualization State ---
let isVisualizing = false;
let isPaused = false;
let runToEnd = false;
let cancelViz = false;
let stepPromise = null;
let stepResolve = null;

// --- Animation Speed ---
let animationDelay = parseInt(speedControl.value);

// --- View State (Zoom/Pan) ---
let scale = 1.0;
let viewOffsetX = 0;
let viewOffsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartOffsetX = 0;
let dragStartOffsetY = 0;
let mouseMovedDuringDrag = false;

// --- Utility Functions ---
function setMessage(msg, isHoverMessage = false) { messageEl.textContent = msg; if (!isHoverMessage) lastActionMessage = msg; }
async function pauseStep(delayMultiplier = 1) { const d = animationDelay * delayMultiplier; if (cancelViz) throw new Error("Visualization cancelled"); if (runToEnd) { await new Promise(r => setTimeout(r, 10)); if (cancelViz) throw new Error("Visualization cancelled"); return; } if (isPaused) { stepPromise = new Promise(r => { stepResolve = r; }); setMessage("Paused.", true); await stepPromise; stepPromise = null; if (cancelViz) throw new Error("Visualization cancelled"); } else { await new Promise(r => setTimeout(r, d)); if (cancelViz) throw new Error("Visualization cancelled"); } }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function resetNodeColors(node) { if (node !== null) { node.color = 'lightblue'; resetNodeColors(node.left); resetNodeColors(node.right); } }

// --- Coordinate Transformation ---
function screenToWorld(screenX, screenY) { const worldX = (screenX - viewOffsetX) / scale; const worldY = (screenY - viewOffsetY) / scale; return { x: worldX, y: worldY }; }

// --- AVL Helpers ---
function avlGetHeight(n) { return n ? n.height : 0; }
function avlUpdateHeight(n) { if (n) n.height = Math.max(avlGetHeight(n.left), avlGetHeight(n.right)) + 1; }
function avlGetBalanceFactor(n) { return n ? avlGetHeight(n.left) - avlGetHeight(n.right) : 0; }
async function avlRotateRight(n) { setMessage(`Right Rot @ ${n.value}.`); n.color = 'purple'; if (n.left) n.left.color = 'orange'; drawTree(); await pauseStep(1.5); let nr = n.left; let T2 = nr.right; nr.right = n; n.left = T2; avlUpdateHeight(n); avlUpdateHeight(nr); n.color = 'lightblue'; nr.color = 'lightblue'; if(T2) T2.color = 'lightblue'; drawTree(); await pauseStep(1); return nr; }
async function avlRotateLeft(n) { setMessage(`Left Rot @ ${n.value}.`); n.color = 'purple'; if (n.right) n.right.color = 'orange'; drawTree(); await pauseStep(1.5); let nr = n.right; let T2 = nr.left; nr.left = n; n.right = T2; avlUpdateHeight(n); avlUpdateHeight(nr); n.color = 'lightblue'; nr.color = 'lightblue'; if(T2) T2.color = 'lightblue'; drawTree(); await pauseStep(1); return nr; }

// --- BST Helpers ---
function bstCalculateHeight(n) { if (n === null) return -1; return Math.max(bstCalculateHeight(n.left), bstCalculateHeight(n.right)) + 1; }
function bstCheckBalanced(n) { if (n === null) return 0; const lH = bstCheckBalanced(n.left); if (lH === -1) return -1; const rH = bstCheckBalanced(n.right); if (rH === -1) return -1; if (Math.abs(lH - rH) > 1) return -1; return Math.max(lH, rH) + 1; }

// --- Core Operations Dispatchers ---
async function insert(v) { if (isVisualizing) { setMessage("Viz running."); return; } isVisualizing = true; disableMainControls(); showStepControls(); cancelViz = false; runToEnd = false; isPaused = false; stepPauseResumeBtn.textContent = 'Pause'; try { resetNodeColors(root); drawTree(); setMessage(`(${currentTreeMode}) Inserting ${v}.`); if (currentTreeMode === 'AVL') root = await avlInsertNode(root, v); else root = await bstInsertNode(root, v); if (!cancelViz) { setMessage(`(${currentTreeMode}) Insert ${v} complete.`); await pauseStep(0.5); } } catch (e) { if (e.message === "Visualization cancelled") setMessage("Insert cancelled."); else { console.error("Insert Error:", e); setMessage("Insert error."); } } finally { resetNodeColors(root); drawTree(); updatePropertiesDisplay(); hideStepControls(); enableMainControls(); isVisualizing = false; } }
async function deleteValue(v) { if (isVisualizing) { setMessage("Viz running."); return; } isVisualizing = true; disableMainControls(); showStepControls(); cancelViz = false; runToEnd = false; isPaused = false; stepPauseResumeBtn.textContent = 'Pause'; try { resetNodeColors(root); drawTree(); setMessage(`(${currentTreeMode}) Deleting ${v}.`); if (currentTreeMode === 'AVL') root = await avlDeleteNode(root, v); else root = await bstDeleteNode(root, v); if (!cancelViz) { setMessage(`(${currentTreeMode}) Delete ${v} complete.`); await pauseStep(0.5); } } catch (e) { if (e.message === "Visualization cancelled") setMessage("Delete cancelled."); else { console.error("Delete Error:", e); setMessage("Delete error."); } } finally { resetNodeColors(root); drawTree(); updatePropertiesDisplay(); hideStepControls(); enableMainControls(); isVisualizing = false; } }

// --- AVL Implementations ---
async function avlInsertNode(n, v) { if (cancelViz) throw new Error("Visualization cancelled"); if (n === null) { setMessage(`Inserted ${v}.`); return new Node(v); } n.color = 'yellow'; drawTree(); await pauseStep(1); if (cancelViz) throw new Error("Visualization cancelled"); n.color = 'lightblue'; if (v < n.value) n.left = await avlInsertNode(n.left, v); else if (v > n.value) n.right = await avlInsertNode(n.right, v); else { setMessage(`${v} exists.`); return n; } avlUpdateHeight(n); let bal = avlGetBalanceFactor(n); setMessage(`Check balance @ ${n.value} (Bal: ${bal}).`); n.color = 'pink'; drawTree(); await pauseStep(1); if (cancelViz) throw new Error("Visualization cancelled"); n.color = 'lightblue'; if (bal > 1 && v < n.left.value) { setMessage(`LL @ ${n.value}. Rotate right.`); await pauseStep(1); return await avlRotateRight(n); } if (bal < -1 && v > n.right.value) { setMessage(`RR @ ${n.value}. Rotate left.`); await pauseStep(1); return await avlRotateLeft(n); } if (bal > 1 && v > n.left.value) { setMessage(`LR @ ${n.value}. Rotate left on ${n.left.value}.`); await pauseStep(1); n.left = await avlRotateLeft(n.left); setMessage(`Now rotate right on ${n.value}.`); await pauseStep(1); return await avlRotateRight(n); } if (bal < -1 && v < n.right.value) { setMessage(`RL @ ${n.value}. Rotate right on ${n.right.value}.`); await pauseStep(1); n.right = await avlRotateRight(n.right); setMessage(`Now rotate left on ${n.value}.`); await pauseStep(1); return await avlRotateLeft(n); } return n; }
async function avlDeleteNode(n, v) { if (cancelViz) throw new Error("Visualization cancelled"); if (n === null) { setMessage(`${v} not found.`); await pauseStep(1); return null; } n.color = 'yellow'; drawTree(); await pauseStep(1); if (cancelViz) throw new Error("Visualization cancelled"); n.color = 'lightblue'; if (v < n.value) n.left = await avlDeleteNode(n.left, v); else if (v > n.value) n.right = await avlDeleteNode(n.right, v); else { setMessage(`Found ${v}. Deleting.`); n.color = 'red'; drawTree(); await pauseStep(1.5); if (cancelViz) throw new Error("Visualization cancelled"); if (n.left === null || n.right === null) { let temp = n.left ? n.left : n.right; if (temp === null) { setMessage(`Deleting leaf ${n.value}.`); await pauseStep(1); n = null; } else { setMessage(`Deleting ${n.value}, replace with ${temp.value}.`); await pauseStep(1.5); n = temp; } } else { setMessage(`${n.value} has 2 children. Find successor.`); await pauseStep(1.5); if (cancelViz) throw new Error("Visualization cancelled"); let succ = findMinNodeHelper(n.right); succ.color = 'purple'; setMessage(`Successor is ${succ.value}. Highlight.`); drawTree(); await pauseStep(2); if (cancelViz) throw new Error("Visualization cancelled"); setMessage(`Replace ${n.value} with ${succ.value}.`); n.value = succ.value; n.color = 'lightblue'; succ.color = 'lightblue'; drawTree(); await pauseStep(2); if (cancelViz) throw new Error("Visualization cancelled"); setMessage(`Delete original successor ${succ.value}.`); await pauseStep(1); n.right = await avlDeleteNode(n.right, succ.value); } } if (n === null) return n; avlUpdateHeight(n); let bal = avlGetBalanceFactor(n); setMessage(`Check balance @ ${n.value} (Bal: ${bal}).`); n.color = 'pink'; drawTree(); await pauseStep(1); if (cancelViz) throw new Error("Visualization cancelled"); n.color = 'lightblue'; if (bal > 1 && avlGetBalanceFactor(n.left) >= 0) { setMessage(`LL post-delete @ ${n.value}. Rotate right.`); await pauseStep(1); return await avlRotateRight(n); } if (bal > 1 && avlGetBalanceFactor(n.left) < 0) { setMessage(`LR post-delete @ ${n.value}. Rotate left on ${n.left.value}.`); await pauseStep(1); n.left = await avlRotateLeft(n.left); setMessage(`Now rotate right on ${n.value}.`); await pauseStep(1); return await avlRotateRight(n); } if (bal < -1 && avlGetBalanceFactor(n.right) <= 0) { setMessage(`RR post-delete @ ${n.value}. Rotate left.`); await pauseStep(1); return await avlRotateLeft(n); } if (bal < -1 && avlGetBalanceFactor(n.right) > 0) { setMessage(`RL post-delete @ ${n.value}. Rotate right on ${n.right.value}.`); await pauseStep(1); n.right = await avlRotateRight(n.right); setMessage(`Now rotate left on ${n.value}.`); await pauseStep(1); return await avlRotateLeft(n); } return n; }

// --- BST Implementations ---
async function bstInsertNode(n, v) { if (cancelViz) throw new Error("Visualization cancelled"); if (n === null) { setMessage(`Inserted ${v}.`); return new Node(v); } n.color = 'yellow'; drawTree(); await pauseStep(1); if (cancelViz) throw new Error("Visualization cancelled"); n.color = 'lightblue'; if (v < n.value) n.left = await bstInsertNode(n.left, v); else if (v > n.value) n.right = await bstInsertNode(n.right, v); else setMessage(`${v} exists.`); return n; }
async function bstDeleteNode(n, v) { if (cancelViz) throw new Error("Visualization cancelled"); if (n === null) { setMessage(`${v} not found.`); await pauseStep(1); return null; } n.color = 'yellow'; drawTree(); await pauseStep(1); if (cancelViz) throw new Error("Visualization cancelled"); n.color = 'lightblue'; if (v < n.value) n.left = await bstDeleteNode(n.left, v); else if (v > n.value) n.right = await bstDeleteNode(n.right, v); else { setMessage(`Found ${v}. Deleting.`); n.color = 'red'; drawTree(); await pauseStep(1.5); if (cancelViz) throw new Error("Visualization cancelled"); if (n.left === null) { let temp = n.right; setMessage(temp ? `Deleting ${n.value}, replace with ${temp.value}.` : `Deleting leaf ${n.value}.`); await pauseStep(1.5); return temp; } else if (n.right === null) { let temp = n.left; setMessage(`Deleting ${n.value}, replace with ${temp.value}.`); await pauseStep(1.5); return temp; } else { setMessage(`${n.value} has 2 children. Find successor.`); await pauseStep(1.5); if (cancelViz) throw new Error("Visualization cancelled"); let succ = findMinNodeHelper(n.right); succ.color = 'purple'; setMessage(`Successor is ${succ.value}. Highlight.`); drawTree(); await pauseStep(2); if (cancelViz) throw new Error("Visualization cancelled"); setMessage(`Replace ${n.value} with ${succ.value}.`); n.value = succ.value; n.color = 'lightblue'; succ.color = 'lightblue'; drawTree(); await pauseStep(2); if (cancelViz) throw new Error("Visualization cancelled"); setMessage(`Delete original successor ${succ.value}.`); await pauseStep(1); n.right = await bstDeleteNode(n.right, succ.value); } } return n; }

// --- Shared Helpers ---
function findMinNodeHelper(n) { let curr = n; while (curr && curr.left !== null) curr = curr.left; return curr; }
function findMaxNodeHelper(n) { let curr = n; while (curr && curr.right !== null) curr = curr.right; return curr; }

// --- Search (Common) ---
async function search(v) { if (isVisualizing) { setMessage("Viz running."); return; } isVisualizing = true; disableMainControls(); showStepControls(); cancelViz = false; runToEnd = false; isPaused = false; stepPauseResumeBtn.textContent = 'Pause'; try { resetNodeColors(root); drawTree(); setMessage(`(${currentTreeMode}) Searching for ${v}.`); await searchNodeVisual(root, v); if (!cancelViz) await pauseStep(0.5); } catch (e) { if (e.message === "Visualization cancelled") setMessage("Search cancelled."); else { console.error("Search Error:", e); setMessage("Search error."); } } finally { resetNodeColors(root); drawTree(); hideStepControls(); enableMainControls(); isVisualizing = false; } }
async function searchNodeVisual(n, v) { if (cancelViz) throw new Error("Visualization cancelled"); if (n === null) { setMessage(`${v} not found.`); await pauseStep(1); return null; } n.color = 'yellow'; drawTree(); await pauseStep(1); if (cancelViz) throw new Error("Visualization cancelled"); if (v === n.value) { n.color = 'lightgreen'; setMessage(`${v} found!`); drawTree(); await pauseStep(2); return n; } else if (v < n.value) { n.color = 'lightblue'; return await searchNodeVisual(n.left, v); } else { n.color = 'lightblue'; return await searchNodeVisual(n.right, v); } }

// --- Traversals (Common) ---
async function runTraversalVisualization(type, helper) { if (isVisualizing) { setMessage("Viz running."); return; } if (root === null) { setMessage("Tree empty."); return; } isVisualizing = true; disableMainControls(); showStepControls(); cancelViz = false; runToEnd = false; isPaused = false; stepPauseResumeBtn.textContent = 'Pause'; try { resetNodeColors(root); drawTree(); setMessage(`(${currentTreeMode}) Performing ${type}.`); await helper(root); if (!cancelViz) { setMessage(`${type} complete.`); await pauseStep(2); } } catch (e) { if (e.message === "Visualization cancelled") setMessage(`${type} cancelled.`); else { console.error(`${type} Error:`, e); setMessage(`${type} error.`); } } finally { resetNodeColors(root); drawTree(); hideStepControls(); enableMainControls(); isVisualizing = false; } }
async function inOrderHelper(n) { if (cancelViz) throw new Error("Visualization cancelled"); if (n === null) return; await inOrderHelper(n.left); if (cancelViz) throw new Error("Visualization cancelled"); n.color = 'cyan'; drawTree(); await pauseStep(1); if (cancelViz) throw new Error("Visualization cancelled"); await inOrderHelper(n.right); }
async function preOrderHelper(n) { if (cancelViz) throw new Error("Visualization cancelled"); if (n === null) return; n.color = 'cyan'; drawTree(); await pauseStep(1); if (cancelViz) throw new Error("Visualization cancelled"); await preOrderHelper(n.left); if (cancelViz) throw new Error("Visualization cancelled"); await preOrderHelper(n.right); }
async function postOrderHelper(n) { if (cancelViz) throw new Error("Visualization cancelled"); if (n === null) return; await postOrderHelper(n.left); if (cancelViz) throw new Error("Visualization cancelled"); await postOrderHelper(n.right); if (cancelViz) throw new Error("Visualization cancelled"); n.color = 'cyan'; drawTree(); await pauseStep(1); }
async function levelOrderHelper(n) { if (cancelViz) throw new Error("Visualization cancelled"); if (n === null) return; const q = [n]; while (q.length > 0) { if (cancelViz) throw new Error("Visualization cancelled"); let lvlSize = q.length; for (let i = 0; i < lvlSize; i++) { if (cancelViz) throw new Error("Visualization cancelled"); let curr = q.shift(); curr.color = 'cyan'; drawTree(); await pauseStep(1); if (curr.left !== null) q.push(curr.left); if (curr.right !== null) q.push(curr.right); } } }

// --- Find Min/Max (Common) ---
async function visualizeFindMin() { if (isVisualizing) return; if (root === null) { setMessage("Tree empty."); return; } isVisualizing = true; disableMainControls(); try { resetNodeColors(root); drawTree(); setMessage(`(${currentTreeMode}) Finding minimum.`); let n = root; while (n !== null) { n.color = 'orange'; drawTree(); await sleep(animationDelay); if (n.left === null) { n.color = 'lightgreen'; setMessage(`Minimum: ${n.value}.`); drawTree(); await sleep(1000); break; } n = n.left; } } finally { resetNodeColors(root); drawTree(); enableMainControls(); isVisualizing = false; } }
async function visualizeFindMax() { if (isVisualizing) return; if (root === null) { setMessage("Tree empty."); return; } isVisualizing = true; disableMainControls(); try { resetNodeColors(root); drawTree(); setMessage(`(${currentTreeMode}) Finding maximum.`); let n = root; while (n !== null) { n.color = 'orange'; drawTree(); await sleep(animationDelay); if (n.right === null) { n.color = 'lightgreen'; setMessage(`Maximum: ${n.value}.`); drawTree(); await sleep(1000); break; } n = n.right; } } finally { resetNodeColors(root); drawTree(); enableMainControls(); isVisualizing = false; } }

// --- Find Successor/Predecessor ---
async function findSuccessor(value) { if (isVisualizing) { setMessage("Viz running."); return; } if (root === null) { setMessage("Tree empty."); return; } isVisualizing = true; disableMainControls(); showStepControls(); cancelViz = false; runToEnd = false; isPaused = false; stepPauseResumeBtn.textContent = 'Pause'; let targetNode = null; let successor = null; try { resetNodeColors(root); drawTree(); setMessage(`Finding node ${value}.`); targetNode = await searchNodeVisual(root, value); if (!targetNode) { setMessage(`${value} not found.`); await pauseStep(1); } else { targetNode.color = 'purple'; setMessage(`Node ${value} found. Finding successor.`); drawTree(); await pauseStep(1.5); if (targetNode.right !== null) { setMessage(`Successor is min in right subtree.`); await pauseStep(1.5); successor = findMinNodeHelper(targetNode.right); successor.color = 'orange'; setMessage(`Successor of ${value} is ${successor.value}.`); drawTree(); await pauseStep(2); } else { setMessage(`Searching up from ${value}.`); await pauseStep(1.5); let current = root; while (current !== null) { if (cancelViz) throw new Error("Visualization cancelled"); current.color = 'yellow'; drawTree(); await pauseStep(1); if (cancelViz) throw new Error("Visualization cancelled"); if (targetNode.value < current.value) { successor = current; current.color = 'lightblue'; current = current.left; } else if (targetNode.value > current.value) { current.color = 'lightblue'; current = current.right; } else break; } if (successor) { successor.color = 'orange'; setMessage(`Successor of ${value} is ${successor.value}.`); drawTree(); await pauseStep(2); } else { setMessage(`${value} is max, no successor.`); drawTree(); await pauseStep(1.5); } } } } catch (e) { if (e.message === "Visualization cancelled") setMessage("Find successor cancelled."); else { console.error("Successor Error:", e); setMessage("Successor error."); } } finally { resetNodeColors(root); drawTree(); hideStepControls(); enableMainControls(); isVisualizing = false; } }
async function findPredecessor(value) { if (isVisualizing) { setMessage("Viz running."); return; } if (root === null) { setMessage("Tree empty."); return; } isVisualizing = true; disableMainControls(); showStepControls(); cancelViz = false; runToEnd = false; isPaused = false; stepPauseResumeBtn.textContent = 'Pause'; let targetNode = null; let predecessor = null; try { resetNodeColors(root); drawTree(); setMessage(`Finding node ${value}.`); targetNode = await searchNodeVisual(root, value); if (!targetNode) { setMessage(`${value} not found.`); await pauseStep(1); } else { targetNode.color = 'purple'; setMessage(`Node ${value} found. Finding predecessor.`); drawTree(); await pauseStep(1.5); if (targetNode.left !== null) { setMessage(`Predecessor is max in left subtree.`); await pauseStep(1.5); predecessor = findMaxNodeHelper(targetNode.left); if (predecessor) { predecessor.color = 'orange'; setMessage(`Predecessor of ${value} is ${predecessor.value}.`); drawTree(); await pauseStep(2); } else { setMessage(`Error finding max in left subtree.`); await pauseStep(1.5); } } else { setMessage(`Searching up from ${value}.`); await pauseStep(1.5); let current = root; while(current !== null) { if (cancelViz) throw new Error("Visualization cancelled"); current.color = 'yellow'; drawTree(); await pauseStep(1); if (cancelViz) throw new Error("Visualization cancelled"); if (targetNode.value > current.value) { predecessor = current; current.color = 'lightblue'; current = current.right; } else if (targetNode.value < current.value) { current.color = 'lightblue'; current = current.left; } else break; } if (predecessor) { predecessor.color = 'orange'; setMessage(`Predecessor of ${value} is ${predecessor.value}.`); drawTree(); await pauseStep(2); } else { setMessage(`${value} is min, no predecessor.`); drawTree(); await pauseStep(1.5); } } } } catch (e) { if (e.message === "Visualization cancelled") setMessage("Find predecessor cancelled."); else { console.error("Predecessor Error:", e); setMessage("Predecessor error."); } } finally { resetNodeColors(root); drawTree(); hideStepControls(); enableMainControls(); isVisualizing = false; } }

// --- Tree Property Display ---
function updatePropertiesDisplay() { const count = countNodes(root); let height = -1; let balancedText = '-'; if (root !== null) { if (currentTreeMode === 'AVL') { height = avlGetHeight(root) - 1; balancedText = 'Yes (AVL)'; } else { height = bstCalculateHeight(root); const balancedResult = bstCheckBalanced(root); balancedText = (balancedResult !== -1) ? 'Yes' : 'No'; } } treeHeightEl.textContent = height < 0 ? '-' : height; nodeCountEl.textContent = count; balancedStatusEl.textContent = balancedText; }
function countNodes(n) { if (n === null) return 0; return 1 + countNodes(n.left) + countNodes(n.right); }

// --- Drawing Logic ---
function drawTree() { ctx.save(); ctx.clearRect(0, 0, canvas.width, canvas.height); if (viewOffsetX === 0 && viewOffsetY === 0 && root !== null) { viewOffsetX = canvas.width / 2; viewOffsetY = 50 * scale; } ctx.translate(viewOffsetX, viewOffsetY); ctx.scale(scale, scale); if (root !== null) { calculatePositions(root, 0, 0, canvas.width / (4 * scale)); drawNode(root); } ctx.restore(); }
function calculatePositions(n, x, y, hOff) { if (n === null) return; n.x = x; n.y = y; const nextHOff = Math.max(hOff / 1.8, NODE_RADIUS * 1.5); if (n.left !== null) calculatePositions(n.left, x - hOff, y + VERTICAL_SPACING, nextHOff); if (n.right !== null) calculatePositions(n.right, x + hOff, y + VERTICAL_SPACING, nextHOff); }
function drawNode(n) { if (n === null) return; ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1 / scale; if (n.left !== null) { ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n.left.x, n.left.y); ctx.stroke(); drawNode(n.left); } if (n.right !== null) { ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n.right.x, n.right.y); ctx.stroke(); drawNode(n.right); } ctx.beginPath(); ctx.arc(n.x, n.y, NODE_RADIUS, 0, Math.PI * 2); ctx.fillStyle = n.color; ctx.fill(); ctx.strokeStyle = 'black'; ctx.lineWidth = 2 / scale; ctx.stroke(); ctx.fillStyle = 'black'; const fontSize = Math.max(8, Math.min(18, 12 / scale)); ctx.font = `${fontSize}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n.value, n.x, n.y - (fontSize / 2.5)); if (currentTreeMode === 'AVL') { const heightFontSize = Math.max(6, Math.min(14, 10 / scale)); ctx.font = `${heightFontSize}px Arial`; ctx.fillText(`h:${n.height}`, n.x, n.y + (fontSize / 1.5)); } }

// --- Event Listeners ---
insertBtn.addEventListener('click', async () => { const v = parseInt(nodeValueInput.value); if (!isNaN(v)) { await insert(v); nodeValueInput.value = ''; } else setMessage("Invalid number."); });
searchBtn.addEventListener('click', async () => { const v = parseInt(nodeValueInput.value); if (!isNaN(v)) { await search(v); nodeValueInput.value = ''; } else setMessage("Invalid number."); });
deleteBtn.addEventListener('click', async () => { const v = parseInt(nodeValueInput.value); if (!isNaN(v)) { await deleteValue(v); nodeValueInput.value = ''; } else setMessage("Invalid number."); });
clearTreeBtn.addEventListener('click', () => { if (isVisualizing) return; root = null; scale = 1.0; viewOffsetX = 0; viewOffsetY = 0; drawTree(); updatePropertiesDisplay(); setMessage("Tree cleared & view reset."); });
bulkInsertBtn.addEventListener('click', async () => { if (isVisualizing) return; const vs = bulkValuesInput.value.trim(); if (!vs) { setMessage("Enter comma-separated values."); return; } const vals = vs.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)); if (vals.length === 0) { setMessage("No valid numbers."); return; } setMessage(`Bulk inserting ${vals.length}.`); disableMainControls(); for (const v of vals) { await insert(v); if (cancelViz) { setMessage("Bulk insert cancelled."); break; } } enableMainControls(); if (!cancelViz) setMessage(`Bulk insert attempt complete.`); bulkValuesInput.value = ''; updatePropertiesDisplay(); });
randomTreeBtn.addEventListener('click', async () => { if (isVisualizing) return; const c = parseInt(randomCountInput.value); if (isNaN(c) || c <= 0 || c > 50) { setMessage("Enter nodes (1-50)."); return; } root = null; scale = 1.0; viewOffsetX = 0; viewOffsetY = 0; drawTree(); updatePropertiesDisplay(); setMessage(`Generating ${c}.`); const genVals = new Set(); let att = 0; while (genVals.size < c && att < c * 5) { genVals.add(Math.floor(Math.random() * 100) + 1); att++; } disableMainControls(); let insCount = 0; for (const v of genVals) { await insert(v); insCount++; if (cancelViz) { setMessage("Random generation cancelled."); break; } } enableMainControls(); if (!cancelViz) setMessage(`Generated/inserted ${insCount} nodes.`); updatePropertiesDisplay(); });
// REMOVED 'click' listener for canvas insert prompt
canvas.addEventListener('contextmenu', async (event) => { event.preventDefault(); if (isVisualizing || root === null) return; const rect = canvas.getBoundingClientRect(); const worldCoords = screenToWorld(event.clientX - rect.left, event.clientY - rect.top); const node = findNodeAtPosition(root, worldCoords.x, worldCoords.y); if (node) { if (confirm(`Delete ${node.value}?`)) await deleteValue(node.value); else setMessage("Delete cancelled."); } });
inOrderBtn.addEventListener('click', async () => await runTraversalVisualization('In-order', inOrderHelper));
preOrderBtn.addEventListener('click', async () => await runTraversalVisualization('Pre-order', preOrderHelper));
postOrderBtn.addEventListener('click', async () => await runTraversalVisualization('Post-order', postOrderHelper));
levelOrderBtn.addEventListener('click', async () => await runTraversalVisualization('Level-order', levelOrderHelper));
findMinBtn.addEventListener('click', async () => await visualizeFindMin());
findMaxBtn.addEventListener('click', async () => await visualizeFindMax());
findSuccessorBtn.addEventListener('click', async () => { const v = parseInt(successorPredecessorValueInput.value); if (!isNaN(v)) await findSuccessor(v); else setMessage("Enter node value for successor."); });
findPredecessorBtn.addEventListener('click', async () => { const v = parseInt(successorPredecessorValueInput.value); if (!isNaN(v)) await findPredecessor(v); else setMessage("Enter node value for predecessor."); });
stepNextBtn.addEventListener('click', () => { if (stepResolve) { stepResolve(); stepResolve = null; stepPromise = null; } });
stepPauseResumeBtn.addEventListener('click', () => { isPaused = !isPaused; stepPauseResumeBtn.textContent = isPaused ? 'Resume' : 'Pause'; if (!isPaused && stepResolve) { stepResolve(); stepResolve = null; stepPromise = null; } });
stepRunBtn.addEventListener('click', () => { runToEnd = true; isPaused = false; stepPauseResumeBtn.textContent = 'Pause'; if (stepResolve) { stepResolve(); stepResolve = null; stepPromise = null; } });
stepCancelBtn.addEventListener('click', () => { cancelViz = true; isPaused = false; runToEnd = false; if (stepResolve) { stepResolve(); stepResolve = null; stepPromise = null; } });
speedControl.addEventListener('change', (event) => { animationDelay = parseInt(event.target.value); });
treeModeRadios.forEach(radio => { radio.addEventListener('change', () => { if (isVisualizing) { setMessage("Cannot change mode during viz."); document.querySelector(`input[name="treeMode"][value="${currentTreeMode}"]`).checked = true; return; } const newMode = document.querySelector(`input[name="treeMode"]:checked`).value; if (newMode !== currentTreeMode) { currentTreeMode = newMode; setMessage(`Switched to ${currentTreeMode}. Tree cleared & view reset.`); root = null; scale = 1.0; viewOffsetX = 0; viewOffsetY = 0; drawTree(); updatePropertiesDisplay(); } }); });
resetViewBtn.addEventListener('click', () => { if(isVisualizing) return; scale = 1.0; viewOffsetX = 0; viewOffsetY = 0; drawTree(); setMessage("View reset."); }); // Reset View Listener

// --- Zoom/Pan Event Listeners ---
canvas.addEventListener('wheel', (event) => { event.preventDefault(); if (isVisualizing) return; const rect = canvas.getBoundingClientRect(); const mouseX = event.clientX - rect.left; const mouseY = event.clientY - rect.top; const worldBefore = screenToWorld(mouseX, mouseY); const delta = event.deltaY * ZOOM_SENSITIVITY * -1; const newScale = scale * (1 + delta); scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale)); const worldAfter = screenToWorld(mouseX, mouseY); viewOffsetX += (worldAfter.x - worldBefore.x) * scale; viewOffsetY += (worldAfter.y - worldBefore.y) * scale; drawTree(); });
canvas.addEventListener('mousedown', (event) => { if (isVisualizing) return; if (event.button === 0) { isDragging = true; mouseMovedDuringDrag = false; dragStartX = event.clientX; dragStartY = event.clientY; dragStartOffsetX = viewOffsetX; dragStartOffsetY = viewOffsetY; canvas.style.cursor = 'grabbing'; } });
canvas.addEventListener('mousemove', (event) => { const rect = canvas.getBoundingClientRect(); const mouseX = event.clientX - rect.left; const mouseY = event.clientY - rect.top; if (isDragging) { const dx = event.clientX - dragStartX; const dy = event.clientY - dragStartY; if (!mouseMovedDuringDrag && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) { mouseMovedDuringDrag = true; } viewOffsetX = dragStartOffsetX + dx; viewOffsetY = dragStartOffsetY + dy; drawTree(); } else if (!isVisualizing && root !== null) { const worldCoords = screenToWorld(mouseX, mouseY); const nodeUnderMouse = findNodeAtPosition(root, worldCoords.x, worldCoords.y); if (nodeUnderMouse) { if (currentlyHoveredNode !== nodeUnderMouse) { currentlyHoveredNode = nodeUnderMouse; setMessage(`Hover: Value ${nodeUnderMouse.value}`, true); canvas.style.cursor = 'pointer'; } } else { if (currentlyHoveredNode !== null) { currentlyHoveredNode = null; setMessage(lastActionMessage); } canvas.style.cursor = 'grab'; } } else { canvas.style.cursor = 'default'; } });
canvas.addEventListener('mouseup', async (event) => { // Make async
    if (event.button === 0) { // Left mouse button
        const wasDragging = isDragging;
        const didMove = mouseMovedDuringDrag;
        isDragging = false;
        mouseMovedDuringDrag = false; // Reset flag
        canvas.style.cursor = 'grab';

        // Only trigger insert prompt if it wasn't a significant drag and not visualizing
        if (!wasDragging || !didMove) { // Check if it was a click (not dragging or didn't move much)
             if (!isVisualizing) { // Check if not visualizing
                const rect = canvas.getBoundingClientRect();
                const clickX = event.clientX - rect.left;
                const clickY = event.clientY - rect.top;
                const worldCoords = screenToWorld(clickX, clickY);
                const node = findNodeAtPosition(root, worldCoords.x, worldCoords.y);

                if (!node) { // Only prompt if clicking on empty space
                    const vs = prompt("Enter value:");
                    if (vs === null) { setMessage("Insert cancelled."); return; }
                    const v = parseInt(vs);
                    if (!isNaN(v)) await insert(v); // Use async insert
                    else if (vs.trim() !== "") setMessage("Invalid number.");
                    else setMessage("No value entered.");
                }
             }
        }
    }
});
canvas.addEventListener('mouseout', () => { if (isDragging) { isDragging = false; canvas.style.cursor = 'grab'; } if (currentlyHoveredNode !== null) { currentlyHoveredNode = null; setMessage(lastActionMessage); } if (!isDragging) { canvas.style.cursor = 'default'; } });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && document.activeElement.tagName !== 'INPUT') { if (isVisualizing) { stepCancelBtn.click(); setMessage("Visualization cancelled via Escape."); } else if (root !== null) { if (confirm("Clear tree? (Esc)")) { clearTreeBtn.click(); } else { setMessage("Clear cancelled."); } } } });

// --- Resize Logic ---
function resizeCanvas() { const dW = canvas.clientWidth; const dH = canvas.clientHeight; if (canvas.width !== dW || canvas.height !== dH) { canvas.width = dW; canvas.height = dH; drawTree(); } }

// --- UI Management ---
function showStepControls() { stepControlsDiv.style.display = 'flex'; }
function hideStepControls() { stepControlsDiv.style.display = 'none'; stepPauseResumeBtn.textContent = 'Pause'; isPaused = false; runToEnd = false; cancelViz = false; stepPromise = null; stepResolve = null; }
function disableMainControls() { [insertBtn, searchBtn, deleteBtn, bulkInsertBtn, randomTreeBtn, clearTreeBtn, inOrderBtn, preOrderBtn, postOrderBtn, levelOrderBtn, findMinBtn, findMaxBtn, findSuccessorBtn, findPredecessorBtn, resetViewBtn].forEach(btn => btn.disabled = true); [nodeValueInput, bulkValuesInput, randomCountInput, successorPredecessorValueInput].forEach(input => input.disabled = true); speedControl.disabled = true; treeModeRadios.forEach(r => r.disabled = true); } // Added resetViewBtn
function enableMainControls() { [insertBtn, searchBtn, deleteBtn, bulkInsertBtn, randomTreeBtn, clearTreeBtn, inOrderBtn, preOrderBtn, postOrderBtn, levelOrderBtn, findMinBtn, findMaxBtn, findSuccessorBtn, findPredecessorBtn, resetViewBtn].forEach(btn => btn.disabled = false); [nodeValueInput, bulkValuesInput, randomCountInput, successorPredecessorValueInput].forEach(input => input.disabled = false); speedControl.disabled = false; treeModeRadios.forEach(r => r.disabled = false); } // Added resetViewBtn

// --- Initial Setup ---
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
updatePropertiesDisplay();
setMessage(lastActionMessage);
canvas.style.cursor = 'grab';

// Helper function needed by context menu listener & hover
function findNodeAtPosition(node, worldX, worldY) { if (node === null) return null; const distance = Math.sqrt(Math.pow(worldX - node.x, 2) + Math.pow(worldY - node.y, 2)); if (distance <= NODE_RADIUS) return node; let foundNode = findNodeAtPosition(node.left, worldX, worldY); if (foundNode) return foundNode; return findNodeAtPosition(node.right, worldX, worldY); }
