const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2.5;
let dy = -2.5;
const ballRadius = 10;
const paddleHeight = 12;
const paddleWidth = 80;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// Brick variables
const brickRowCount = 5;
const brickColumnCount = 7;
const brickWidth = 50;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 40;
const brickOffsetLeft = 30;

// Game state
let score = 0;
let lives = 3;
let level = 1;
const maxLevel = 3;
let bricksLeft = 0;

// Neon colors for bricks based on durability
const brickColors = ["#ff47ab", "#ff7d47", "#ffff47"]; // Pink, Orange, Yellow

let bricks = [];

// --- Game Setup ---

function setupBricksForLevel() {
    bricks = [];
    bricksLeft = 0;
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            let brickStatus = 0;
            if (level === 1) {
                if (c > 0 && c < brickColumnCount - 1) {
                    brickStatus = 1;
                }
            } else if (level === 2) {
                brickStatus = (r % 2 === 0) ? 2 : 1;
            } else if (level === 3) {
                if (c > 0 && c < brickColumnCount - 1 && r < brickRowCount - 1) {
                    brickStatus = r + 1;
                }
            }

            if (brickStatus > 0) {
                bricks[c][r] = { x: 0, y: 0, status: brickStatus };
                bricksLeft++;
            } else {
                bricks[c][r] = { x: 0, y: 0, status: 0 };
            }
        }
    }
}

// --- Event Handlers ---

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("touchmove", touchMoveHandler, { passive: false });

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function handlePointerMove(clientX) {
    const rect = canvas.getBoundingClientRect();
    let relativeX = clientX - rect.left;
    if (relativeX < paddleWidth / 2) relativeX = paddleWidth / 2;
    if (relativeX > canvas.width - paddleWidth / 2) relativeX = canvas.width - paddleWidth / 2;
    paddleX = relativeX - paddleWidth / 2;
}

function mouseMoveHandler(e) {
    handlePointerMove(e.clientX);
}

function touchMoveHandler(e) {
    handlePointerMove(e.touches[0].clientX);
    e.preventDefault();
}


// --- Collision Detection ---

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status > 0) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status--;
                    if (b.status === 0) {
                        score += 10 * level;
                        bricksLeft--;
                        if (bricksLeft === 0) {
                            levelUp();
                        }
                    }
                }
            }
        }
    }
}

// --- Game State Changes ---

function levelUp() {
    level++;
    if (level > maxLevel) {
        alert("YOU WIN, CONGRATULATIONS!");
        document.location.reload();
    } else {
        alert("LEVEL " + level + "!");
        dx = dx > 0 ? dx + 0.5 : dx - 0.5;
        dy = dy > 0 ? dy + 0.5 : dy - 0.5;
        setupBricksForLevel();
        resetBallAndPaddle();
    }
}

function resetBallAndPaddle() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    paddleX = (canvas.width - paddleWidth) / 2;
}

function loseLife() {
    lives--;
    if (!lives) {
        alert("GAME OVER");
        document.location.reload();
    } else {
        resetBallAndPaddle();
    }
}

// --- Drawing Functions ---

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#f0a500";
    ctx.shadowColor = '#f0a500';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0; // Reset shadow for other elements
}

function drawPaddle() {
    ctx.beginPath();
    const gradient = ctx.createLinearGradient(paddleX, 0, paddleX + paddleWidth, 0);
    gradient.addColorStop(0, "#1e90ff");
    gradient.addColorStop(1, "#00e6e6");
    ctx.fillStyle = gradient;
    ctx.fillRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status > 0) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                const color = brickColors[bricks[c][r].status - 1] || brickColors[brickColors.length - 1];
                const gradient = ctx.createLinearGradient(brickX, brickY, brickX, brickY + brickHeight);
                gradient.addColorStop(0, color);
                // The faulty line is corrected here to properly calculate and format the darker color.
                const darkerColorValue = (parseInt(color.slice(1), 16) * 0.7) | 0;
                const darkerColorHex = darkerColorValue.toString(16).padStart(6, '0');
                gradient.addColorStop(1, `#${darkerColorHex}`);
                ctx.fillStyle = gradient;
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                ctx.closePath();
            }
        }
    }
}

function drawText() {
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillStyle = "#e0e0e0";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 8, 24);
    ctx.textAlign = "right";
    ctx.fillText("Lives: " + lives, canvas.width - 8, 24);
    ctx.textAlign = "center";
    ctx.fillText("Level: " + level, canvas.width / 2, 24);
}

// --- Main Game Loop ---

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBall();
    drawText();
    collisionDetection();

    // Ball movement logic
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            loseLife();
        }
    }

    // Paddle movement logic
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

// --- Start Game ---
setupBricksForLevel();
draw();
