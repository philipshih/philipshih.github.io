// --- DOM Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const gameOverDiv = document.getElementById('gameOver');
const leaderboardDiv = document.getElementById('leaderboard');
const highScoresList = document.getElementById('highScores');
const nextPieceCanvas = document.getElementById('nextPieceCanvas');
const nextCtx = nextPieceCanvas.getContext('2d');
const holdPieceCanvas = document.getElementById('holdPieceCanvas');
const holdCtx = holdPieceCanvas.getContext('2d');
const pauseIndicator = document.getElementById('pauseIndicator');
const timerSpan = document.getElementById('timer'); // Added Timer Element

// --- Game Constants ---
const COLS = 10; // Number of columns in the grid
const ROWS = 20; // Number of rows in the grid
const BLOCK_SIZE = canvas.width / COLS; // Size of each block based on canvas width and columns
const EMPTY_COLOR = '#e9ecef'; // Background color of the grid (matches new canvas bg)
const BORDER_COLOR = 'rgba(0, 0, 0, 0.1)'; // Match block border in CSS
const GHOST_PIECE_COLOR = 'rgba(128, 128, 128, 0.3)'; // Semi-transparent grey for ghost
const NEXT_HOLD_BLOCK_SIZE = 80 / 4; // Adjusted for new 80x80 canvas size
const LINE_CLEAR_COLOR = 'white';
const LINE_CLEAR_DELAY = 150;

// Viridis-like Color Palette (adjust as needed)
const VIRIDIS_COLORS = {
    PURPLE: '#440154', // T-piece
    BLUE: '#3b528b',   // J-piece
    TEAL: '#21918c',   // I-piece
    GREEN: '#5ec962',  // S-piece
    LIME: '#fde725',   // O-piece (using yellow end for contrast)
    ORANGE: '#feb479', // L-piece (using a distinct orange/peach)
    RED: '#e15759',    // Z-piece (using a distinct red)
};

// --- Tetrominoes (Shapes and Colors) ---
const TETROMINOES = {
    'I': { shape: [[1, 1, 1, 1]], color: VIRIDIS_COLORS.TEAL },
    'J': { shape: [[1, 0, 0], [1, 1, 1]], color: VIRIDIS_COLORS.BLUE },
    'L': { shape: [[0, 0, 1], [1, 1, 1]], color: VIRIDIS_COLORS.ORANGE },
    'O': { shape: [[1, 1], [1, 1]], color: VIRIDIS_COLORS.LIME },
    'S': { shape: [[0, 1, 1], [1, 1, 0]], color: VIRIDIS_COLORS.GREEN },
    'T': { shape: [[0, 1, 0], [1, 1, 1]], color: VIRIDIS_COLORS.PURPLE },
    'Z': { shape: [[1, 1, 0], [0, 1, 1]], color: VIRIDIS_COLORS.RED }
};
const TETROMINO_KEYS = Object.keys(TETROMINOES);

// --- Game State Variables ---
let board = [];
let currentPiece = null;
let nextPiece = null;
let heldPiece = null; // Added
let canHold = true; // Added: Can the player hold the current piece?
let currentX = 0;
let currentY = 0;
let score = 0;
let level = 0;
let gameRunning = true;
let isPaused = false; // Added
let animationFrameId = null; // Added for pausing game loop
let dropCounter = 0;
let dropInterval = 1000;
let isClearingLines = false;
let clearedRows = [];
let highScores = [];
const MAX_HIGH_SCORES = 5;
const BASE_DROP_INTERVAL = 1000; // Starting speed
const MIN_DROP_INTERVAL = 150; // Fastest speed
const LEVEL_UP_SCORE = 500; // Score needed to increase level/speed

// --- Timer State Variables --- Added
let startTime = 0;
let elapsedTime = 0; // Total elapsed time in milliseconds
let timerIntervalId = null;
let pausedTime = 0; // Time when the game was paused

// --- Firebase Initialization --- (Copied from Snake Game)
const firebaseConfig = {
  apiKey: "AIzaSyD0UXPmEWedaOQrnC4OwThzje9LZMDr_LU", // Replace with your actual API key if needed
  authDomain: "snake-game-leaderboard-733a3.firebaseapp.com",
  projectId: "snake-game-leaderboard-733a3",
  storageBucket: "snake-game-leaderboard-733a3.firebasestorage.app",
  messagingSenderId: "589878348449",
  appId: "1:589878348449:web:40c4d2dd80d9f33f653ee0",
  measurementId: "G-V0FBH6PBD5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Get Firestore instance
const highScoresCollection = db.collection('highscores-tetris'); // Use a different collection for Tetris scores

// --- Leaderboard Functions (Firestore Version) --- (Copied and adapted from Snake Game)

async function loadHighScores() {
    console.log("Attempting to load Tetris scores from Firestore...");
    try {
        const snapshot = await highScoresCollection
            .orderBy('score', 'desc')
            .limit(MAX_HIGH_SCORES)
            .get();

        highScores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Loaded Tetris scores from Firestore:", highScores);
        if (highScores.length === 0) {
            console.log("Firestore returned no Tetris scores.");
        }
    } catch (error) {
        console.error("Error loading Tetris high scores from Firestore:", error);
        highScores = []; // Reset on error
    }
}

function displayHighScores() {
    console.log("Displaying Tetris scores. Current highScores array:", highScores);
    highScoresList.innerHTML = ''; // Clear existing list
    if (highScores.length === 0) {
        console.log("Tetris high scores array is empty, displaying loading message.");
        highScoresList.innerHTML = '<li>Loading scores or no scores yet...</li>';
    } else {
        highScores.forEach(scoreEntry => {
            const li = document.createElement('li');
            li.textContent = `${scoreEntry.name}: ${scoreEntry.score}`;
            highScoresList.appendChild(li);
        });
    }
    leaderboardDiv.style.display = 'block'; // Make sure it's visible
}

async function updateLeaderboard(newScore) {
    if (newScore <= 0) {
        console.log("Score is 0, not updating leaderboard.");
        return; // Don't add 0 scores
    }
    try {
        // Fetch current scores to check qualification and count
        const snapshot = await highScoresCollection.orderBy('score', 'desc').get();
        const currentScores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const lowestScore = currentScores.length < MAX_HIGH_SCORES ? -1 : currentScores[currentScores.length - 1].score; // Use -1 if fewer than max scores

        if (newScore > lowestScore) {
            const name = prompt(`New high score (${newScore})! Enter your name (max 10 chars):`);
            const playerName = name ? name.substring(0, 10) : "Anonymous";

            // Add the new score
            await highScoresCollection.add({
                name: playerName,
                score: newScore,
                timestamp: firebase.firestore.FieldValue.serverTimestamp() // Use server time
            });
            console.log("New Tetris score added to Firestore.");

            // If leaderboard is now too large, remove the actual lowest score from Firestore
            if (currentScores.length >= MAX_HIGH_SCORES) {
                 // Refetch ordered scores to be sure we delete the correct one
                 const updatedSnapshot = await highScoresCollection.orderBy('score', 'asc').limit(1).get();
                 if (!updatedSnapshot.empty) {
                    const lowestDocId = updatedSnapshot.docs[0].id;
                    await highScoresCollection.doc(lowestDocId).delete();
                    console.log("Removed lowest Tetris score from Firestore.");
                 }
            }

            // Reload and display updated scores
            await loadHighScores();
            displayHighScores();

        } else {
             console.log("Tetris score not high enough for leaderboard.");
        }
    } catch (error) {
        console.error("Error updating Tetris leaderboard:", error);
    }
}

// --- Core Tetris Logic (Placeholder - To be implemented) ---

function createBoard() {
    // Implementation needed
    console.log("Creating board...");
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0)); // 0 represents empty cell
}

function getRandomPiece() {
    // Implementation needed
    console.log("Getting random piece...");
    const type = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
    const pieceData = TETROMINOES[type];
    // Return the raw data, position is set when it becomes the current piece
    return {
        shape: pieceData.shape,
        color: pieceData.color,
    };
}

function setNewPiece(pieceData) { // Added pieceData parameter
     if (!pieceData) { // Add check for safety
        console.error("setNewPiece called with null/undefined pieceData");
        gameOver(); // Treat as game over if no piece data
        return false;
    }
    currentPiece = pieceData; // Use the parameter
    currentPiece.x = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPiece.y = 0;

    // Adjust Y if piece starts partially off-screen (relevant for I piece)
    // Find the topmost block in the shape
    let topBlockOffset = 0;
    for(let y=0; y<currentPiece.shape.length; y++){
        if(currentPiece.shape[y].some(val => val === 1)){
            topBlockOffset = y;
            break;
        }
    }
    currentPiece.y = -topBlockOffset; // Start piece higher based on its shape


    if (!isValidMove(currentPiece.x, currentPiece.y, currentPiece.shape)) {
         // If the initial position is invalid right away, it's game over
         gameOver();
         return false; // Indicate game over
    }
    canHold = true; // Allow holding the new piece
    return true; // Indicate success
}

function spawnNewPiece() {
    if (!setNewPiece(nextPiece)) { // Try to set the next piece as current
        return false; // Game over if failed
    }
    nextPiece = getRandomPiece(); // Generate the next one
    drawNextPiece();
    return true;
}

// Helper function to draw pieces in the side panels (Next/Hold)
function drawSidePanelPiece(ctx, canvas, piece) {
    ctx.fillStyle = EMPTY_COLOR; // Background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!piece) return;

    const shape = piece.shape;
    const color = piece.color;
    const shapeWidth = shape[0].length;
    const shapeHeight = shape.length;

    // Calculate offsets to center the piece
    const offsetX = (canvas.width - shapeWidth * NEXT_HOLD_BLOCK_SIZE) / 2;
    const offsetY = (canvas.height - shapeHeight * NEXT_HOLD_BLOCK_SIZE) / 2;

    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = color;
                ctx.fillRect(
                    offsetX + x * NEXT_HOLD_BLOCK_SIZE,
                    offsetY + y * NEXT_HOLD_BLOCK_SIZE,
                    NEXT_HOLD_BLOCK_SIZE, NEXT_HOLD_BLOCK_SIZE
                );
                ctx.strokeStyle = BORDER_COLOR;
                ctx.strokeRect(
                    offsetX + x * NEXT_HOLD_BLOCK_SIZE,
                    offsetY + y * NEXT_HOLD_BLOCK_SIZE,
                    NEXT_HOLD_BLOCK_SIZE, NEXT_HOLD_BLOCK_SIZE
                ); // Removed extra parenthesis here
            }
        });
    });
}

function drawNextPiece() {
    drawSidePanelPiece(nextCtx, nextPieceCanvas, nextPiece);
}

function drawHeldPiece() {
    drawSidePanelPiece(holdCtx, holdPieceCanvas, heldPiece);
}

function holdCurrentPiece() {
    if (!canHold || isClearingLines || isPaused) return; // Prevent holding if not allowed, clearing, or paused

    if (heldPiece === null) {
        // First hold: store current, get next
        heldPiece = { shape: currentPiece.shape, color: currentPiece.color }; // Store data only
        spawnNewPiece(); // Get next piece as current, generate new next
    } else {
        // Swap: store current data, set current to held, update held
        const tempPieceData = { shape: currentPiece.shape, color: currentPiece.color };
        if (!setNewPiece(heldPiece)) { // Try setting held piece as current
             // If setting held piece fails (e.g., no space), don't complete the swap
             return;
        }
        heldPiece = tempPieceData;
    }

    canHold = false; // Can only hold once per piece placement
    drawHeldPiece(); // Update display
}

function drawBlock(x, y, color) {
    // Implementation needed
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = BORDER_COLOR;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    // Draw the static board
    for (let r = 0; r < ROWS; r++) {
        // Skip drawing rows that are currently being cleared (handled separately)
        if (isClearingLines && clearedRows.includes(r)) {
            continue;
        }
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) { // If the cell has a settled piece color
                drawBlock(c, r, board[r][c]);
            } else { // Draw empty cell background
                 drawBlock(c, r, EMPTY_COLOR);
            }
        }
    }
}

function drawPiece(piece) {
    // Draw the actual falling piece
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                // Only draw blocks that are within the visible board area
                if (piece.y + y >= 0) {
                    drawBlock(piece.x + x, piece.y + y, piece.color);
                }
            }
        });
    });
}

function getGhostPieceY() {
    if (!currentPiece) return currentPiece.y;
    let ghostY = currentPiece.y;
    while (isValidMove(currentPiece.x, ghostY + 1, currentPiece.shape)) {
        ghostY++;
    }
    return ghostY;
}

function drawGhostPiece() {
    if (!currentPiece || isClearingLines || isPaused) return;

    const ghostY = getGhostPieceY();
    const shape = currentPiece.shape;

    ctx.globalAlpha = 0.3; // Make ghost semi-transparent
    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                 if (ghostY + y >= 0) { // Only draw if within board bounds
                    drawBlock(currentPiece.x + x, ghostY + y, currentPiece.color); // Use piece color but with alpha
                 }
            }
        });
    });
    ctx.globalAlpha = 1.0; // Reset alpha
}

function isValidMove(newX, newY, pieceShape) {
    // Implementation needed
    for (let y = 0; y < pieceShape.length; y++) {
        for (let x = 0; x < pieceShape[y].length; x++) {
            if (pieceShape[y][x]) {
                let boardX = newX + x;
                let boardY = newY + y;

                // Check boundaries
                if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                    return false; // Out of bounds (left, right, bottom)
                }
                // Check collision with settled pieces (only if within board vertically)
                if (boardY >= 0 && board[boardY][boardX]) {
                    return false; // Collision with existing block
                }
            }
        }
    }
    return true;
}

function rotatePiece(piece) {
    // Implementation needed: Rotate shape matrix clockwise
    const shape = piece.shape;
    const N = shape.length; // Assuming square or rectangular matrix
    const M = shape[0].length;
    const newShape = Array.from({ length: M }, () => Array(N).fill(0));

    for (let r = 0; r < N; r++) {
        for (let c = 0; c < M; c++) {
            if (shape[r][c]) {
                newShape[c][N - 1 - r] = 1;
            }
        }
    }
    return newShape;
}


function handleRotation() {
    const rotatedShape = rotatePiece(currentPiece);
    if (isValidMove(currentPiece.x, currentPiece.y, rotatedShape)) {
        currentPiece.shape = rotatedShape;
    } else {
        // Try wall kick (basic: move 1 right, then 1 left)
        if (isValidMove(currentPiece.x + 1, currentPiece.y, rotatedShape)) {
            currentPiece.x++;
            currentPiece.shape = rotatedShape;
        } else if (isValidMove(currentPiece.x - 1, currentPiece.y, rotatedShape)) {
            currentPiece.x--;
            currentPiece.shape = rotatedShape;
        }
        // Could add more complex wall kick logic here if needed
    }
}


function mergePiece() {
    // Implementation needed: Add piece to the board grid
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                // Only merge if the block is within the visible board area
                if (currentPiece.y + y >= 0) {
                     board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
                }
            }
        });
    });
}

function clearLines() {
    if (isClearingLines) return 0; // Don't check while animating

    clearedRows = []; // Reset cleared rows list
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            clearedRows.push(r); // Mark row for clearing
        }
    }

    if (clearedRows.length > 0) {
        isClearingLines = true; // Start animation state
        // Flash effect - draw cleared rows in white
        clearedRows.forEach(r => {
            for (let c = 0; c < COLS; c++) {
                drawBlock(c, r, LINE_CLEAR_COLOR);
            }
        });

        // After a delay, actually remove the lines
        setTimeout(() => {
            // Remove lines from bottom up
            clearedRows.sort((a, b) => a - b); // Ensure ascending order
            clearedRows.forEach(rowIndex => {
                 board.splice(rowIndex, 1);
                 board.unshift(Array(COLS).fill(0));
            });

            // Update score based on lines cleared
            const basePoints = [0, 100, 300, 500, 800]; // Points for 1, 2, 3, 4 lines
            score += basePoints[clearedRows.length] * (level + 1); // Multiply by level factor
            scoreSpan.textContent = score;

            // Update level and speed
            const newLevel = Math.floor(score / LEVEL_UP_SCORE);
            if (newLevel > level) {
                level = newLevel;
                // Calculate new interval (e.g., decrease by 10% per level, capped)
                dropInterval = Math.max(MIN_DROP_INTERVAL, BASE_DROP_INTERVAL * Math.pow(0.9, level));
                console.log(`Level Up: ${level}, New Interval: ${dropInterval}`);
            }

            isClearingLines = false; // End animation state
            clearedRows = []; // Clear the list
        }, LINE_CLEAR_DELAY);
    }
    return clearedRows.length; // Return number of lines cleared (or 0 if animating)
}


function pieceDrop() {
    if (isClearingLines || isPaused) return; // Pause dropping during animation or pause

    if (!isValidMove(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
        // Cannot move down further, merge and get new piece
        mergePiece();
        const lines = clearLines(); // Check for cleared lines
        if (!isClearingLines) { // Only get new piece if not animating
             if (!spawnNewPiece()) { // spawnNewPiece returns false on game over
                 return; // Stop drop if game over
             }
        }
    } else {
        // Move down
        currentPiece.y++;
    }
    dropCounter = 0; // Reset counter after drop/merge
}

// --- Game Loop ---
let lastTime = 0;
function updateGame(time = 0) {
    if (!gameRunning) return;
    if (isPaused) {
        // If paused, keep requesting frames but don't update game state
        animationFrameId = requestAnimationFrame(updateGame);
        return;
    }

    const deltaTime = time - lastTime;
    lastTime = time;

    // Only advance drop counter if not clearing lines
    if (!isClearingLines) {
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            pieceDrop();
        }
    }

    // Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear main canvas
    drawBoard(); // Draw static board (handles skipping cleared rows)
    drawGhostPiece(); // Draw ghost piece first
    if (currentPiece && !isClearingLines) { // Don't draw falling piece during clear animation
        drawPiece(currentPiece);
    }
    // If clearing lines, the flash effect is drawn in clearLines via setTimeout

    animationFrameId = requestAnimationFrame(updateGame); // Request next frame
}

function togglePause() {
    if (!gameRunning) return; // Can't pause if game over

    isPaused = !isPaused;
    pauseIndicator.style.display = isPaused ? 'block' : 'none';

    if (!isPaused) {
        // Resume game loop
        lastTime = performance.now(); // Reset lastTime to avoid large deltaTime jump
        if (!animationFrameId) { // Restart loop if it was fully stopped
             animationFrameId = requestAnimationFrame(updateGame);
        }
    } else {
         // Stop requesting new frames if pausing (optional, updateGame handles pause state)
         // if (animationFrameId) {
         //    cancelAnimationFrame(animationFrameId);
         //    animationFrameId = null;
         // }
    }
    console.log("Game Paused:", isPaused);

    if (isPaused) {
        // Stop the timer interval and record pause time
        clearInterval(timerIntervalId);
        timerIntervalId = null;
        pausedTime = Date.now();
    } else {
        // Resume timer: Calculate time spent paused and adjust start time
        const timePaused = Date.now() - pausedTime;
        startTime += timePaused; // Effectively shift start time forward
        // Restart the timer interval
        if (!timerIntervalId) {
            timerIntervalId = setInterval(updateTimer, 1000);
        }
    }
}

// --- Timer Functions --- Added

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTimer() {
    if (!gameRunning || isPaused) return; // Don't update if game over or paused

    elapsedTime = Date.now() - startTime;
    timerSpan.textContent = formatTime(elapsedTime);
}

// --- Game Over ---
async function gameOver() {
    console.log("Game Over!");
    gameRunning = false;
    isPaused = false; // Ensure not paused on game over
    pauseIndicator.style.display = 'none';
    gameOverDiv.style.display = 'block';
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // Stop the game loop
        animationFrameId = null;
    }
    // Stop the timer
    clearInterval(timerIntervalId);
    timerIntervalId = null;

    await updateLeaderboard(score);
}

// --- Input Handling ---
function handleKeyDown(event) {
    // Allow restart even if paused
    if (!gameRunning) {
        if (event.keyCode === 13) { // Enter key
            initializeGame();
        }
        return;
    }

     // Handle pause toggle first
     if (event.keyCode === 80) { // 'P' key
        event.preventDefault();
        togglePause();
        return; // Don't process other keys if pausing/unpausing
    }

    // Ignore game controls if paused or clearing lines
    if (isPaused || isClearingLines) return;


    switch (event.keyCode) {
        case 37: // Left Arrow
            event.preventDefault();
            if (isValidMove(currentPiece.x - 1, currentPiece.y, currentPiece.shape)) {
                currentPiece.x--;
            }
            break;
        case 39: // Right Arrow
            event.preventDefault();
            if (isValidMove(currentPiece.x + 1, currentPiece.y, currentPiece.shape)) {
                currentPiece.x++;
            }
            break;
        case 40: // Down Arrow
            event.preventDefault();
            // Move down faster
            pieceDrop();
            // Reset drop counter to avoid immediate double drop after manual drop
            dropCounter = 0;
            break;
        case 38: // Up Arrow
            event.preventDefault();
            handleRotation();
            break;
        case 67: // 'C' key for Hold
            event.preventDefault();
            holdCurrentPiece();
            break;
        case 32: // Spacebar for Hard Drop
            event.preventDefault();
            hardDrop();
            break;
    }
}

function hardDrop() {
    if (isPaused || isClearingLines || !currentPiece) return;

    // Find the lowest valid position (ghost piece position)
    let dropY = currentPiece.y;
    while (isValidMove(currentPiece.x, dropY + 1, currentPiece.shape)) {
        dropY++;
    }

    // Move the piece directly there
    if (dropY > currentPiece.y) {
        const linesDropped = dropY - currentPiece.y;
        currentPiece.y = dropY;
        // Optional: Add score for hard drop based on lines dropped
        // score += linesDropped * 1; // e.g., 1 point per line dropped
        // scoreSpan.textContent = score;
    }

    // Merge, clear lines, and get new piece immediately
    mergePiece();
    const lines = clearLines();
    if (!isClearingLines) {
        if (!spawnNewPiece()) {
            return; // Game over
        }
    }
    dropCounter = 0; // Reset drop counter as piece has landed
}


// --- Touch Controls --- (Basic Implementation)
let touchStartX = 0;
let touchStartY = 0;
let touchTapTime = 0; // To detect taps vs swipes

function handleTouchStart(event) {
    if (!gameRunning) return;
    event.preventDefault(); // Prevent scrolling/zooming
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
    touchTapTime = Date.now(); // Record time for tap detection
}

function handleTouchEnd(event) {
    if (!gameRunning) return;
    event.preventDefault();

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const touchEndTime = Date.now();

    const dxSwipe = touchEndX - touchStartX;
    const dySwipe = touchEndY - touchStartY;
    const absDx = Math.abs(dxSwipe);
    const absDy = Math.abs(dySwipe);
    const duration = touchEndTime - touchTapTime;

    // Detect Tap (short duration, minimal movement)
    if (duration < 200 && absDx < 10 && absDy < 10) {
        handleRotation();
        return; // Don't process as swipe
    }

    // Detect Swipe (longer duration or significant movement)
    if (absDx > 20 || absDy > 20) { // Minimum swipe distance threshold
        if (absDx > absDy) {
            // Horizontal swipe
            if (dxSwipe > 0 && isValidMove(currentPiece.x + 1, currentPiece.y, currentPiece.shape)) { // Right
                currentPiece.x++;
            } else if (dxSwipe < 0 && isValidMove(currentPiece.x - 1, currentPiece.y, currentPiece.shape)) { // Left
                currentPiece.x--;
            }
        } else {
            // Vertical swipe (only down matters)
            if (dySwipe > 0) { // Down
                pieceDrop();
                dropCounter = 0; // Reset drop counter
            }
            // Ignore up swipes for now
        }
    }
}


// --- Game Initialization ---
async function initializeGame() {
    console.log("Initializing Tetris game...");
    createBoard();
    score = 0;
    level = 0;
    scoreSpan.textContent = score;
    dropInterval = BASE_DROP_INTERVAL;
    dropCounter = 0;
    isClearingLines = false;
    clearedRows = [];
    heldPiece = null; // Reset held piece
    canHold = true; // Allow holding first piece
    gameRunning = true;
    isPaused = false; // Ensure not paused initially
    pauseIndicator.style.display = 'none';
    gameOverDiv.style.display = 'none';

    // Reset Timer
    clearInterval(timerIntervalId); // Clear any existing timer
    timerIntervalId = null;
    startTime = Date.now();
    elapsedTime = 0;
    pausedTime = 0;
    timerSpan.textContent = formatTime(0); // Reset display
    timerIntervalId = setInterval(updateTimer, 1000); // Start new timer

    // Initialize first two pieces
    nextPiece = getRandomPiece();
    spawnNewPiece(); // Sets current from next, generates new next

    await loadHighScores();
    displayHighScores();
    drawNextPiece();
    drawHeldPiece(); // Draw empty hold initially

    // Start game loop
    lastTime = performance.now(); // Use performance.now() for higher precision
    if (animationFrameId) { // Clear previous loop if restarting
        cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(updateGame);

    console.log("Game initialized.");
}

// --- Event Listeners ---
document.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('touchstart', handleTouchStart, { passive: false }); // Use passive: false to allow preventDefault
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

// --- Start Game ---
initializeGame(); // Start the game when script loads

// --- Iframe Height Communication ---
let lastSentHeight = 0;
const HEIGHT_DEBOUNCE_DELAY = 250; // Debounce sending height messages (milliseconds)
let heightSendTimeout = null;

function sendHeightToParent() {
    clearTimeout(heightSendTimeout); // Clear previous timeout if any
    heightSendTimeout = setTimeout(() => {
        let height = 0;
        const gameContainer = document.querySelector('.game-container');
        const footer = document.querySelector('.copyright-footer');
        let bottomElement = null;

        // Find the element that is lower on the page
        if (gameContainer && footer) {
            bottomElement = (gameContainer.offsetTop + gameContainer.offsetHeight > footer.offsetTop + footer.offsetHeight) ? gameContainer : footer;
        } else {
            bottomElement = gameContainer || footer;
        }

        if (bottomElement) {
            // Calculate height based on the bottom edge of the lowest element
            height = bottomElement.offsetTop + bottomElement.offsetHeight;
        } else {
            // Fallback if elements aren't found (shouldn't happen)
            height = document.documentElement.scrollHeight;
        }

        height += 30; // Add a safety buffer

        // Only send if height has actually changed since last send
        if (height !== lastSentHeight) {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({ frameHeight: height }, '*');
                console.log("Sent height (Tetris - Element Offset):", height);
                lastSentHeight = height; // Update last sent height
            }
        }
    }, HEIGHT_DEBOUNCE_DELAY);
}

// Send height initially, on resize, and after game over might change layout
window.addEventListener('load', sendHeightToParent);
window.addEventListener('resize', sendHeightToParent);

// Wrap the existing gameOver function to call sendHeightToParent after leaderboard update
const originalGameOverTetris = gameOver;
gameOver = async function() {
    await originalGameOverTetris.apply(this, arguments); // Call original gameOver
    // Add a small delay to allow DOM updates (like leaderboard) before sending height
    setTimeout(sendHeightToParent, 150);
};

// Also call after loading scores initially, as leaderboard height changes
const originalInitializeGame = initializeGame;
initializeGame = async function() {
    await originalInitializeGame.apply(this, arguments); // Call original initializeGame
    setTimeout(sendHeightToParent, 150); // Send height after initial load
}; // Added missing closing brace and semicolon
