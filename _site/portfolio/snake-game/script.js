const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const gameOverDiv = document.getElementById('gameOver');
const leaderboardDiv = document.getElementById('leaderboard'); // Added
const highScoresList = document.getElementById('highScores'); // Added

const gridSize = 20; // Size of each grid cell and snake segment
const canvasSize = canvas.width; // Assuming square canvas
const tileCount = canvasSize / gridSize; // Number of tiles in each row/column

// Game variables
let snake = [{ x: 10, y: 10 }]; // Initial snake position (array of segments)
let dx = 0; // Initial horizontal velocity
let dy = 0; // Initial vertical velocity
let food = { x: 15, y: 15 }; // Initial food position
let score = 0;
let changingDirection = false; // Prevent rapid 180-degree turns
let gameRunning = true;
let gameLoopInterval = null;
let highScores = []; // Will be populated from Firestore
const MAX_HIGH_SCORES = 5; // Max scores to keep

// --- Firebase Initialization --- Added Section
const firebaseConfig = {
  apiKey: "AIzaSyD0UXPmEWedaOQrnC4OwThzje9LZMDr_LU",
  authDomain: "snake-game-leaderboard-733a3.firebaseapp.com",
  projectId: "snake-game-leaderboard-733a3",
  storageBucket: "snake-game-leaderboard-733a3.firebasestorage.app", // Corrected key
  messagingSenderId: "589878348449",
  appId: "1:589878348449:web:40c4d2dd80d9f33f653ee0",
  measurementId: "G-V0FBH6PBD5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Get Firestore instance
const highScoresCollection = db.collection('highscores'); // Reference to the collection

// --- Leaderboard Functions (Firestore Version) --- Modified Section

async function loadHighScores() {
    console.log("Attempting to load scores from Firestore..."); // Added log
    try {
        const snapshot = await highScoresCollection
            .orderBy('score', 'desc')
            .limit(MAX_HIGH_SCORES)
            .get();

        highScores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Store doc id too
        console.log("Loaded scores from Firestore:", highScores); // Modified log
        if (highScores.length === 0) {
            console.log("Firestore returned no scores."); // Added log
        }
    } catch (error) {
        console.error("Error loading high scores from Firestore:", error); // Modified log
        highScores = []; // Reset on error
    }
}

// No separate saveHighScores needed, done within updateLeaderboard

function displayHighScores() {
    console.log("Displaying scores. Current highScores array:", highScores); // Added log
    highScoresList.innerHTML = ''; // Clear existing list
    if (highScores.length === 0) {
        console.log("High scores array is empty, displaying loading message."); // Added log
        highScoresList.innerHTML = '<li>Loading scores or no scores yet...</li>';
    }
    highScores.forEach(scoreEntry => {
        const li = document.createElement('li');
        li.textContent = `${scoreEntry.name}: ${scoreEntry.score}`;
        highScoresList.appendChild(li);
    });
    leaderboardDiv.style.display = 'block'; // Make sure it's visible
}

async function updateLeaderboard(newScore) {
    try {
        // Fetch current scores to check qualification and count
        const snapshot = await highScoresCollection.orderBy('score', 'desc').get();
        const currentScores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const lowestScore = currentScores.length < MAX_HIGH_SCORES ? 0 : currentScores[currentScores.length - 1].score;

        if (newScore > lowestScore) {
            const name = prompt(`New high score (${newScore})! Enter your name (max 10 chars):`);
            const playerName = name ? name.substring(0, 10) : "Anonymous";

            // Add the new score
            await highScoresCollection.add({
                name: playerName,
                score: newScore,
                timestamp: firebase.firestore.FieldValue.serverTimestamp() // Use server time
            });
            console.log("New score added to Firestore.");

            // If leaderboard is now too large, remove the actual lowest score from Firestore
            if (currentScores.length >= MAX_HIGH_SCORES) {
                 // Refetch ordered scores to be sure we delete the correct one
                 const updatedSnapshot = await highScoresCollection.orderBy('score', 'asc').limit(1).get();
                 if (!updatedSnapshot.empty) {
                    const lowestDocId = updatedSnapshot.docs[0].id;
                    await highScoresCollection.doc(lowestDocId).delete();
                    console.log("Removed lowest score from Firestore.");
                 }
            }

            // Reload and display updated scores
            await loadHighScores();
            displayHighScores();

        } else {
             console.log("Score not high enough for leaderboard.");
        }
    } catch (error) {
        console.error("Error updating leaderboard:", error);
    }
}


// --- Game Initialization ---
async function initializeGame() { // Make async
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreSpan.textContent = score;
    changingDirection = false;
    gameRunning = true;
    gameOverDiv.style.display = 'none';
    placeFood();
    await loadHighScores(); // Load scores on init (await)
    displayHighScores(); // Display scores on init
    if (gameLoopInterval) clearInterval(gameLoopInterval); // Clear previous interval if restarting
    gameLoopInterval = setInterval(gameLoop, 100); // Start game loop (100ms = 10fps)
}

// --- Game Loop ---
function gameLoop() {
    if (!gameRunning) return;

    changingDirection = false; // Allow direction change for next frame
    clearCanvas();
    moveSnake();
    drawFood();
    drawSnake();
    checkCollision(); // Check collisions after moving
}

// --- Drawing Functions ---
function clearCanvas() {
    ctx.fillStyle = '#eee'; // Match background color
    ctx.fillRect(0, 0, canvasSize, canvasSize);
}

function drawSnakeSegment(segment) {
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'darkgreen';
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
}

function drawSnake() {
    snake.forEach(drawSnakeSegment);
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'darkred';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// --- Movement and Logic ---
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head); // Add new head

    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreSpan.textContent = score;
        placeFood(); // Place new food
    } else {
        snake.pop(); // Remove tail segment if no food eaten
    }
}

function placeFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    // Ensure food doesn't spawn on the snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood(); // Recursively try again if collision
        }
    });
}

function changeDirection(event) {
    if (changingDirection) return; // Prevent changing direction multiple times per frame

    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const ENTER_KEY = 13; // For restart

    const keyPressed = event.keyCode;

    // Prevent reversing direction
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) { dx = -1; dy = 0; changingDirection = true; }
    if (keyPressed === UP_KEY && !goingDown) { dx = 0; dy = -1; changingDirection = true; }
    if (keyPressed === RIGHT_KEY && !goingLeft) { dx = 1; dy = 0; changingDirection = true; }
    if (keyPressed === DOWN_KEY && !goingUp) { dx = 0; dy = 1; changingDirection = true; }

    // Handle direction changes only if the game is running
    if (gameRunning) {
        if (keyPressed === LEFT_KEY && !goingRight) { dx = -1; dy = 0; changingDirection = true; }
        if (keyPressed === UP_KEY && !goingDown) { dx = 0; dy = -1; changingDirection = true; }
        if (keyPressed === RIGHT_KEY && !goingLeft) { dx = 1; dy = 0; changingDirection = true; }
        if (keyPressed === DOWN_KEY && !goingUp) { dx = 0; dy = 1; changingDirection = true; }
    } else {
        // Restart game on Enter ONLY if game is over
        if (keyPressed === ENTER_KEY) {
            initializeGame();
        }
    }
}

// --- Collision Detection ---
function checkCollision() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Self collision (check if head collides with any other segment)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

// --- Game Over ---
async function gameOver() { // Make async
    gameRunning = false;
    gameOverDiv.style.display = 'block';
    clearInterval(gameLoopInterval); // Stop the loop
    await updateLeaderboard(score); // Update leaderboard on game over (await)
}

// --- Touch Controls --- Added Section
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
}

function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    handleSwipe();
}

function handleSwipe() {
    if (changingDirection || !gameRunning) return; // Don't change direction if already changing or game over

    const dxSwipe = touchEndX - touchStartX;
    const dySwipe = touchEndY - touchStartY;
    const absDx = Math.abs(dxSwipe);
    const absDy = Math.abs(dySwipe);

    // Determine swipe direction (only if swipe is significant enough)
    if (Math.max(absDx, absDy) > 30) { // Minimum swipe distance threshold
        // Prevent reversing direction
        const goingUp = dy === -1;
        const goingDown = dy === 1;
        const goingRight = dx === 1;
        const goingLeft = dx === -1;

        if (absDx > absDy) {
            // Horizontal swipe
            if (dxSwipe > 0 && !goingLeft) { dx = 1; dy = 0; changingDirection = true; } // Right
            else if (dxSwipe < 0 && !goingRight) { dx = -1; dy = 0; changingDirection = true; } // Left
        } else {
            // Vertical swipe
            if (dySwipe > 0 && !goingUp) { dx = 0; dy = 1; changingDirection = true; } // Down
            else if (dySwipe < 0 && !goingDown) { dx = 0; dy = -1; changingDirection = true; } // Up
        }
    }
}

// --- Event Listeners ---
document.addEventListener('keydown', changeDirection);
canvas.addEventListener('touchstart', handleTouchStart, false); // Listen on canvas
canvas.addEventListener('touchend', handleTouchEnd, false);   // Listen on canvas

// Prevent scrolling when swiping on canvas
canvas.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, { passive: false });


// --- Start Game ---
initializeGame(); // Start the game when script loads
