const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

const score = document.querySelector(".score--value")
const finalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen")
const buttonPlay = document.querySelector(".btn-play")
const toggleBorderMode = document.querySelector("#toggleBorderMode")
const gameOverMenu = document.querySelector(".game-over-menu")
const pauseScreen = document.querySelector(".pause-screen")
const buttonResume = document.querySelector(".btn-resume")
const buttonRestart = document.querySelector(".btn-restart")
const welcomeScreen = document.querySelector(".welcome-screen")
const buttonStart = document.querySelector(".btn-start")

const audio = new Audio("../assets/eatsong.mp3")
const gameOverSounds = [
    new Audio("../assets/morte1.mp3"),
    new Audio("../assets/morte2.mp3"),
    new Audio("../assets/morte3.mp3"),
    new Audio("../assets/morte4.mp3"),
    new Audio("../assets/morte5.mp3")
]
const gameStartSounds = [
    new Audio("../assets/inicio1.mp3"),
    new Audio("../assets/inicio2.mp3"),
    new Audio("../assets/inicio3.mp3")
]

const welcomeAudio = new Audio("../assets/telainicio2.mp3"); // Corrigido nome para welcomeAudio

const score400Audio = new Audio("../assets/pontuacao400.mp3"); // Áudio para pontuação 400
const score910Audio = new Audio("../assets/pontuacao910.mp3"); // Áudio para pontuação 910

let score400Played = false; // Garantir que o áudio de 400 toque apenas uma vez
let score910Played = false;

const size = 30

const initialPosition = { x: 270, y: 240 }

let snake = [initialPosition]

let firstMove = true

const incrementScore = () => {
    score.innerText = +score.innerText + 10
}

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / 30) * 30
}

const randomColor = () => {
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

let direction, loopId

const drawFood = () => {
    const { x, y, color } = food

    ctx.shadowColor = color
    ctx.shadowBlur = 20
    ctx.fillStyle = color
    ctx.fillRect(x, y, size, size)
    ctx.shadowBlur = 0
}

const drawSnake = () => {
    ctx.fillStyle = "#ddd"

    snake.forEach((position, index) => {
        if (index == snake.length - 1) {
            ctx.fillStyle = "white"
        }

        ctx.fillRect(position.x, position.y, size, size)
    })
}

const moveSnake = () => {
    if (!direction) return

    const head = snake[snake.length - 1]

    if (direction == "right") {
        snake.push({ x: head.x + size, y: head.y })
    }

    if (direction == "left") {
        snake.push({ x: head.x - size, y: head.y })
    }

    if (direction == "down") {
        snake.push({ x: head.x, y: head.y + size })
    }

    if (direction == "up") {
        snake.push({ x: head.x, y: head.y - size })
    }

    snake.shift()
}

const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = "#191919"

    for (let i = 30; i < canvas.width; i += 30) {
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }
}

const checkEat = () => {
    const head = snake[snake.length - 1]

    if (head.x == food.x && head.y == food.y) {
        incrementScore()
        snake.push(head)
        audio.play()

        let x = randomPosition()
        let y = randomPosition()

        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
        }

        food.x = x
        food.y = y
        food.color = randomColor()
    }
}

const checkCollision = () => {
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2
    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y;
    })

    if (toggleBorderMode.checked) {
        if (head.x < 0) head.x = canvasLimit
        else if (head.x > canvasLimit) head.x = 0

        if (head.y < 0) head.y = canvasLimit
        else if (head.y > canvasLimit) head.y = 0
    } else {
        const wallCollision =
            head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

        const selfCollision = snake.find((position, index) => {
            return index < neckIndex && position.x == head.x && position.y == head.y
        });

        if (wallCollision || selfCollision) {
            gameOver()
            return
        }
    }
    if (selfCollision) {
        gameOver()
    }
}

let baseSpeed = 300
let minSpeed = 100
let maxPoints = 300
let levels = 10
let pointsPerLevel = maxPoints / levels

const calculateSpeed = () => {
    let currentScore = parseInt(score.innerText)

    if (currentScore >= 400 && !score400Played) {
        score400Audio.play();
        score400Played = true;
    }
    if (currentScore >= 910 && !score910Played) {
        score910Audio.play();
        score910Played = true;
    }

    let currentLevel = Math.floor(currentScore / pointsPerLevel)
    let newSpeed = baseSpeed - ((baseSpeed - minSpeed) / levels) * currentLevel

    return Math.max(newSpeed, minSpeed)
}

let isPaused = false
let isGameOver = false

const togglePause = () => {
    if (isGameOver) return; // Evita pausa se o jogo estiver em Game Over

    isPaused = !isPaused;

    if (isPaused) {
        clearTimeout(loopId);
        pauseScreen.style.display = "flex"; // Mostra a tela de pausa
        canvas.style.filter = "blur(8px)";
        pauseScreen.querySelector('.current-score span').innerText = score.innerText;
    } else {
        pauseScreen.style.display = "none"; // Esconde a tela de pausa
        canvas.style.filter = "none";
        gameLoop(); // Retoma o jogo
    }
};

const gameOver = () => {
    isGameOver = true;
    clearTimeout(loopId);
    
    const randomSound = gameOverSounds[Math.floor(Math.random() * gameOverSounds.length)];
    randomSound.play()

    gameOverMenu.style.display = "flex"; // Mostra a tela de Game Over
    finalScore.innerText = score.innerText;
    canvas.style.filter = "blur(8px)";
};

const gameLoop = () => {
    if (isPaused || isGameOver) return

    clearTimeout(loopId)

    ctx.clearRect(0, 0, 600, 600)
    drawGrid()
    drawFood()
    moveSnake()
    drawSnake()
    checkEat()
    checkCollision()

    loopId = setTimeout(() => {
        gameLoop()
    }, calculateSpeed())
}

welcomeScreen.style.display = "flex";
canvas.style.filter = "blur(8px)"
welcomeAudio.loop = true
welcomeAudio.play()

gameLoop()

document.addEventListener("keydown", ({ key }) => {
    if (!direction) { // Toca o som de início apenas na primeira movimentação
        if (firstMove) {
            firstMove = false;
            const randomStartSound = gameStartSounds[Math.floor(Math.random() * gameStartSounds.length)];
            randomStartSound.play();
        }
    }

    if (key == " ") {
        togglePause()
    }

    if (!isPaused && !isGameOver) {
        if (key == "ArrowRight" && direction != "left") {
        direction = "right"
        }

        if (key == "ArrowLeft" && direction != "right") {
        direction = "left"
        }

        if (key == "ArrowDown" && direction != "up") {
        direction = "down"
        }

        if (key == "ArrowUp" && direction != "down") {
        direction = "up"
        }
    }
})

buttonStart.addEventListener("click", () => {
    welcomeScreen.style.display = "none"; // Esconde a tela inicial
    canvas.style.filter = "none"; // Remove qualquer desfoque do canvas
    firstMove = true
    // Inicializa o loop principal apenas ao começar o jogo
    welcomeAudio.pause();
    welcomeAudio.currentTime = 0;
    score400Played = false;
    score910Played = false;
    gameLoop();
});

buttonPlay.addEventListener("click", () => {
    score.innerText = "00";
    gameOverMenu.style.display = "none";
    pauseScreen.style.display = "none";
    canvas.style.filter = "none";

    snake = [initialPosition];
    isPaused = false;
    isGameOver = false;
    direction = undefined;
    firstMove = true
    score400Played = false;
    score910Played = false;

    gameLoop();
});

buttonResume.addEventListener('click', () => {
    togglePause(); // Retoma o jogo
});

buttonRestart.addEventListener('click', () => {
    score.innerText = "00";
    pauseScreen.style.display = "none"; // Fecha a tela de pausa
    canvas.style.filter = "none";

    snake = [initialPosition];
    isPaused = false;
    isGameOver = false;
    direction = undefined;
    firstMove = true

    gameLoop(); // Reinicia o jogo
});