const game = document.getElementById("game")
const startBtn = document.getElementById("startBtn")
const scoreEl = document.getElementById("score")
const livesEl = document.getElementById("lives")

let started = false
let score = 0
let lives = 3
let level = 1
let direction = null
let moveInterval = null
let enemyInterval = null

const maze=[
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
[1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
[1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1],
[1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1],
[1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,1],
[1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1],
[1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1],
[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
[1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
[1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
[1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1],
[1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
[1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1],
[1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
[1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

let player = { x: 1, y: 1 }
let enemies = []
let points = []

function createPoints() {
    points = []
    maze.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 0 && !(x === 1 && y === 1)) {
                points.push({ x, y })
            }
        })
    })
}

function drawMaze() {
    game.innerHTML = ""

    maze.forEach((row) => {
        row.forEach((cell) => {
            const div = document.createElement("div")
            if (cell === 1) div.classList.add("wall")
            game.appendChild(div)
        })
    })

    points.forEach(p => {
        const index = p.y * 15 + p.x
        const dot = document.createElement("div")
        dot.classList.add("point")
        game.children[index].appendChild(dot)
    })

    drawPlayer()
    drawEnemies()
}

function drawPlayer() {
    const index = player.y * 15 + player.x
    game.children[index].id = "player"
}

function createLives() {
    livesEl.innerHTML = ""
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement("span")
        heart.textContent = "❤️"
        livesEl.appendChild(heart)
    }
}

function movePlayer() {
    if (!direction) return

    let nx = player.x
    let ny = player.y

    if (direction === "ArrowUp") ny--
    if (direction === "ArrowDown") ny++
    if (direction === "ArrowLeft") nx--
    if (direction === "ArrowRight") nx++

    if (maze[ny][nx] === 1) return

    player.x = nx
    player.y = ny

    points = points.filter(p => {
        if (p.x === player.x && p.y === player.y) {
            score++
            scoreEl.textContent = score
            return false
        }
        return true
    })

    drawMaze()
    checkEnemyCollision()
    checkWin()
}

function randomFree() {
    let x, y
    do {
        x = Math.floor(Math.random() * 15)
        y = Math.floor(Math.random() * 15)
    } while (maze[y][x] !== 0 || (x === 1 && y === 1))
    return { x, y }
}

function createEnemies(count) {
    enemies = []
    for (let i = 0; i < count; i++) {
        enemies.push(randomFree())
    }
}

function drawEnemies() {
    enemies.forEach(e => {
        const index = e.y * 15 + e.x
        game.children[index].classList.add("enemy")
    })
}

function moveEnemies() {
    enemies.forEach(e => {

        let dx = player.x - e.x
        let dy = player.y - e.y
        let distance = Math.abs(dx) + Math.abs(dy)

        let moves = []

        if (distance <= 6) {

            if (Math.abs(dx) > Math.abs(dy)) {
                moves.push([Math.sign(dx), 0])
                moves.push([0, Math.sign(dy)])
            } else {
                moves.push([0, Math.sign(dy)])
                moves.push([Math.sign(dx), 0])
            }

            moves.push([1, 0], [-1, 0], [0, 1], [0, -1])

        } else {

            moves = [[1, 0], [-1, 0], [0, 1], [0, -1]]
            moves.sort(() => Math.random() - 0.5)

        }

        for (let m of moves) {
            let nx = e.x + m[0]
            let ny = e.y + m[1]
            if (maze[ny][nx] === 0) {
                e.x = nx
                e.y = ny
                break
            }
        }

    })

    drawMaze()
    checkEnemyCollision()
}

function checkEnemyCollision() {
    for (let e of enemies) {
        if (e.x === player.x && e.y === player.y) {
            hitPlayer()
            break
        }
    }
}

function hitPlayer() {
    lives--
    createLives()
    direction = null

    const p = document.getElementById("player")
    p.classList.add("hit")

    setTimeout(() => {
        if (lives <= 0) {
            gameOver()
        } else {
            drawMaze()
        }
    }, 1500)
}

function checkWin() {
    if (points.length === 0) {
        saveScore()
        nextLevel()
    }
}

function nextLevel() {
    level++
    createPoints()
    createEnemies(level)
    drawMaze()
}

function saveScore() {
    const name = prompt("Enter name")
    const data = JSON.parse(localStorage.getItem("scores")) || []
    data.push({ name, score })
    data.sort((a, b) => b.score - a.score)
    localStorage.setItem("scores", JSON.stringify(data.slice(0, 5)))
    showLeaderboard()
}

function showLeaderboard() {
    const board = document.querySelector(".leaderboard")
    const data = JSON.parse(localStorage.getItem("scores")) || []
    board.innerHTML = "<h3>Leaderboard</h3>"
    data.forEach(s => {
        const p = document.createElement("p")
        p.textContent = `${s.name} - ${s.score}`
        board.appendChild(p)
    })
}

function gameOver() {
    clearInterval(moveInterval)
    clearInterval(enemyInterval)
    startBtn.style.display = "block"
    startBtn.textContent = "Restart?"
    started = false
}

startBtn.onclick = () => {
    startBtn.style.display = "none"
    started = true
    score = 0
    level = 1
    lives = 3
    player = { x: 1, y: 1 }

    createLives()
    createPoints()
    createEnemies(1)
    drawMaze()
    showLeaderboard()

    moveInterval = setInterval(movePlayer, 200)
    enemyInterval = setInterval(moveEnemies, 350)
}

document.addEventListener("keydown", e => {
    if (!started) return
    direction = e.key
})

document.querySelectorAll(".controls button").forEach(btn => {
    btn.onclick = () => {
        if (!started) return
        direction = btn.dataset.dir
    }
})