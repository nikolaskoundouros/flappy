const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bird, pipes, coins, score, gameOver, gameStarted, highScore, gameSpeed;

// Images
const birdImage = new Image();
birdImage.src = 'flappy.png'; // Replace with a bird icon
const pipeImage = new Image();
pipeImage.src = 'pipe.jpg'; // Replace with a pipe image
const coinImage = new Image();
coinImage.src = 'coin.png'; // Replace with a coin image
const backgroundImage = new Image();
backgroundImage.src = 'background.jpg'; // Replace with a cool background image

// Screens
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const gameOverScreen = document.getElementById("gameOverScreen");
const playAgainButton = document.getElementById("playAgainButton");
const highScoreDisplay = document.getElementById("highScoreDisplay");
const currentScoreDisplay = document.getElementById("currentScoreDisplay");

// Event listeners
startButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", restartGame);
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && gameStarted && !gameOver) {
        bird.velocity = -bird.jump;
    }
});

// Initialize or reset game variables
function resetGame() {
    bird = { x: canvas.width / 8, y: canvas.height / 2, width: 60, height: 60, gravity: 0.4, jump: 7, velocity: 0 };
    pipes = [];
    coins = [];
    score = 0;
    gameSpeed = 3;
    gameOver = false;
    gameStarted = false;
    highScore = localStorage.getItem('highScore') || 0;
}

// Start the game
function startGame() {
    resetGame();
    startScreen.style.display = "none";
    gameStarted = true;
    requestAnimationFrame(gameLoop);
}

// Restart the game
function restartGame() {
    resetGame();
    gameOverScreen.style.display = "none";
    startGame();
}

// Generate pipes and coins
function generatePipe() {
    const pipeGap = canvas.height / 3;
    const pipeHeight = Math.random() * (canvas.height - pipeGap - 100);
    pipes.push({ x: canvas.width, y: pipeHeight });

    // Add coins spaced logically
    for (let i = 0; i < 3; i++) {
        const coinX = canvas.width + i * 150; // Shorter horizontal spacing
        const coinY = pipeHeight + (pipeGap / 3) * i; // Vertical placement around pipe gap
        coins.push({ x: coinX, y: coinY });
    }
}

// Update the game state
function update() {
    if (gameOver) return;

    // Bird movement
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Generate pipes and coins
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width * 0.6) {
        generatePipe();
    }

    // Move pipes and check collision
    pipes = pipes.map(pipe => {
        pipe.x -= gameSpeed;

        // Bird collision with pipes
        if (
            bird.x < pipe.x + 70 &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.y || bird.y > pipe.y + canvas.height / 3)
        ) {
            gameOver = true;
        }

        return pipe;
    }).filter(pipe => pipe.x > -70);

    // Move coins and check collection
    coins = coins.filter(coin => {
        coin.x -= gameSpeed;

        if (
            bird.x < coin.x + 40 &&
            bird.x + bird.width > coin.x &&
            bird.y < coin.y + 40 &&
            bird.y + bird.height > coin.y
        ) {
            score++;
            return false; // Remove collected coin
        }

        return coin.x > -40; // Keep coins that are still on-screen
    });

    // Increase game speed over time
    if (score % 5 === 0 && score > 0) {
        gameSpeed += 0.05; // Slightly increase speed every 10 points
    }

    // Bird out of bounds
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver = true;
    }

    // Update highscore
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }

    // Update score on the game over screen
    highScoreDisplay.textContent = highScore;
    currentScoreDisplay.textContent = score;
}

// Draw the game visuals
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background image
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw bird
    ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);

    // Draw pipes
    pipes.forEach(pipe => {
        ctx.drawImage(pipeImage, pipe.x, 0, 70, pipe.y);
        ctx.drawImage(pipeImage, pipe.x, pipe.y + canvas.height / 3, 70, canvas.height - (pipe.y + canvas.height / 3));
    });

    // Draw coins
    coins.forEach(coin => {
        ctx.drawImage(coinImage, coin.x, coin.y, 40, 40);
    });

    // Draw score at the top center
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`Score: ${score}`, canvas.width / 2, 50);

    // Show game over screen
    if (gameOver) {
        gameOverScreen.style.display = "flex";
    }
}

// Game loop
function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}
