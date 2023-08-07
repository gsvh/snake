// Constants
const BOARD_SIZE = 20
const CELL_SIZE = 20
const SPEED = 150 // Milliseconds between each move
const FOOD_SCORE = 10

// Variables
let highScore = 0
let snake = [{ x: 5, y: 10 }]
let direction = 'right'
let isGameOver = false
let score = 0
let food
let interval

// DOM Elements
const gameBoard = document.getElementById('game-board')
const scoreDisplay = document.getElementById('score')
const highScoreButton = document.getElementById('highscore')
// const highScoreContainer = document.getElementById('highscore-container')
const startButton = document.getElementById('start-button')
const gameOverMessage = document.getElementById('game-over')

// Function to create and update the game board
function createGameBoard() {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement('div')
      cell.style.width = CELL_SIZE + 'px'
      cell.style.height = CELL_SIZE + 'px'
      gameBoard.appendChild(cell)
    }
  }
}

function drawSnake() {
  gameBoard.querySelectorAll('.snake').forEach((cell) => {
    cell.classList.remove('snake', 'head')
  })

  snake.forEach((segment, index) => {
    const cellIndex = segment.x + segment.y * BOARD_SIZE
    const cell = gameBoard.children[cellIndex]
    cell.classList.add('snake')
    if (index === 0) {
      cell.classList.add('head')
    }
  })
}

// Function to clear the food off the game board
function clearFood() {
  gameBoard.querySelectorAll('div').forEach((cell) => {
    // Remove the classes related to the snake segments
    cell.classList.remove('food')
  })
}

function checkCollisions(newHead) {
  return !!(
    newHead.x < 0 ||
    newHead.x >= BOARD_SIZE ||
    newHead.y < 0 ||
    newHead.y >= BOARD_SIZE ||
    snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
  )
}

// Function to move the snake
function moveSnake() {
  const head = { ...snake[0] }
  const newHead = { ...head } // Create a new head to update its position

  // Update the new head's position based on the current direction
  switch (direction) {
    case 'up':
      newHead.y--
      break
    case 'down':
      newHead.y++
      break
    case 'left':
      newHead.x--
      break
    case 'right':
      newHead.x++
      break
  }

  // Check for collisions with the boundaries and the snake's body
  const isColliding = checkCollisions(newHead)

  // Move the snake if there are no collisions
  if (!isColliding) {
    snake.unshift(newHead) // Add the new head to the beginning of the snake
    const hasEatenFood = newHead.x === food.x && newHead.y === food.y

    if (hasEatenFood) {
      score += FOOD_SCORE

      generateFood()
    } else {
      snake.pop() // Remove the last segment of the snake if it hasn't eaten food
    }
  } else {
    isGameOver = true // The snake collided, so the game is over
  }
}

// Function to generate food randomly on the game board
function generateFood() {
  clearFood()
  food = {
    x: Math.floor(Math.random() * BOARD_SIZE),
    y: Math.floor(Math.random() * BOARD_SIZE),
  }

  // Ensure the food doesn't spawn on the snake's position
  if (
    snake.some((segment) => segment.x === food.x && segment.y === food.y) ||
    (food.x === 10 && food.y === 10)
  ) {
    generateFood()
    return // Exit the function to prevent drawing food multiple times
  }

  // Draw the food on the game board
  const foodCellIndex = food.x + food.y * BOARD_SIZE
  const foodCell = gameBoard.children[foodCellIndex]
  foodCell.classList.add('food')
}

// Function to handle player input and change the snake's direction
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      if (direction !== 'down') direction = 'up'
      break
    case 'ArrowDown':
      if (direction !== 'up') direction = 'down'
      break
    case 'ArrowLeft':
      if (direction !== 'right') direction = 'left'
      break
    case 'ArrowRight':
      if (direction !== 'left') direction = 'right'
      break
  }
})

// Function to reset the game
function resetGame() {
  loadHighScore()
  gameOverMessage.style.display = 'none'
  snake = [{ x: 10, y: 10 }]
  direction = 'right'
  isGameOver = false
  score = 0
}

function updateGame() {
  if (isGameOver && interval) {
    clearInterval(interval)

    // Set high score
    if (score > highScore) {
      highScore = score
      localStorage.setItem('highScore', highScore)
      updateHighScoreDisplay()
    }

    // Display the Game Over message and score
    gameOverMessage.textContent = `Game Over! Your score: ${score}`
    gameOverMessage.style.display = 'block'
    startButton.style.display = 'block'
    startButton.textContent = 'Try again'
    return
  }
  drawSnake()
  moveSnake()
  scoreDisplay.textContent = 'Score: ' + score
}

function loadHighScore() {
  const storedHighScore = localStorage.getItem('highScore')
  if (storedHighScore) {
    highScore = parseInt(storedHighScore)
    updateHighScoreDisplay()
  }
}

function copyHighScore(score, link) {
  const highScoreString = `Beat my SNEK high score:\n 🐍 ${score} 🐍\n${link}`

  ;(async () => {
    await copyToClipboard(highScoreString)
    alert('Copied high score! 🐍')
  })()
}

// Function to update the high score display
function updateHighScoreDisplay() {
  highScoreButton.textContent = `🐍 High Score: ${highScore}`
}

// Function to copy the high score to the clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('Content copied to clipboard')
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}

// Function to start the game loop
function startGame() {
  if (isGameOver) {
    resetGame()
  }

  // Hide the Start Game button when the game starts
  startButton.style.display = 'none'
  generateFood()
  interval = setInterval(updateGame, SPEED)
}

createGameBoard()
loadHighScore()

startButton.addEventListener('click', startGame)
highScoreButton.addEventListener('click', () =>
  copyHighScore(highScore, 'https://snake-04md.onrender.com')
)
