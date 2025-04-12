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
let highScores = []; // Added for leaderboard
const MAX_HIGH_SCORES = 5; // Added: Max scores to keep

// --- Leaderboard Functions --- Added Section
const initialHighScores = [
    { name: "AI Pro", score: 150 },
    { name: "SnakeMaster", score: 100 },
    { name: "PixelEater", score: 70 },
    { name: "GridRunner", score: 40 },
    { name: "Noob", score: 10 }
];

function loadHighScores() {
    const storedScores = localStorage.getItem('snakeHighScores');
    if (storedScores) {
        highScores = JSON.parse(storedScores);
    } else {
        // Use initial scores if nothing is stored
        highScores = [...initialHighScores];
        saveHighScores(); // Save initial scores to localStorage
    }
    // Ensure scores are sorted on load
    highScores.sort((a, b) => b.score - a.score);
}

function saveHighScores() {
    localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
}

function displayHighScores() {
    highScoresList.innerHTML = ''; // Clear existing list
    highScores.forEach(scoreEntry => {
        const li = document.createElement('li');
        li.textContent = `${scoreEntry.name}: ${scoreEntry.score}`;
        highScoresList.appendChild(li);
    });
    leaderboardDiv.style.display = 'block'; // Make sure it's visible
}

function updateLeaderboard(newScore) {
    // Check if the score is high enough
    const lowestScore = highScores.length < MAX_HIGH_SCORES ? 0 : highScores[MAX_HIGH_SCORES - 1].score;

    if (newScore > lowestScore) {
        const name = prompt(`New high score! Enter your name (max 10 chars):`);
        const playerName = name ? name.substring(0, 10) : "Anonymous"; // Limit name length

        highScores.push({ name: playerName, score: newScore });
        highScores.sort((a, b) => b.score - a.score); // Sort descending
        highScores = highScores.slice(0, MAX_HIGH_SCORES); // Keep only top scores

        saveHighScores();
        displayHighScores();
    }
}


// --- Game Initialization ---
function initializeGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreSpan.textContent = score;
    changingDirection = false;
    gameRunning = true;
    gameOverDiv.style.display = 'none';
    placeFood();
    loadHighScores(); // Load scores on init
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
function gameOver() {
    gameRunning = false;
    gameOverDiv.style.display = 'block';
    clearInterval(gameLoopInterval); // Stop the loop
    updateLeaderboard(score); // Update leaderboard on game over
}

// --- Event Listeners ---
document.addEventListener('keydown', changeDirection);

// --- Start Game ---
initializeGame(); // Start the game when script loads
