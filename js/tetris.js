// =========================================================================
// PEGASUS_ENGINE // TETRIS_CORE
// Cartucho Modular - js/tetris.js
// =========================================================================

const canvas = document.getElementById('tetris'); 
const context = canvas.getContext('2d'); 
context.scale(20, 20);
const COLORS = [ null, '#8be9fd', '#ff79c6', '#ffb86c', '#f1fa8c', '#50fa7b', '#bd93f9', '#ff5555' ];

function createPiece(type) {
    if (type === 'I') return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]; 
    if (type === 'L') return [[0,2,0],[0,2,0],[0,2,2]];
    if (type === 'J') return [[0,3,0],[0,3,0],[3,3,0]]; 
    if (type === 'O') return [[4,4],[4,4]];
    if (type === 'Z') return [[5,5,0],[0,5,5],[0,0,0]]; 
    if (type === 'S') return [[0,6,6],[6,6,0],[0,0,0]]; 
    if (type === 'T') return [[0,7,0],[7,7,7],[0,0,0]];
}

function draw() { 
    context.fillStyle = '#050505'; 
    context.fillRect(0, 0, canvas.width, canvas.height); 
    drawMatrix(arena, {x: 0, y: 0}); 
    drawMatrix(player.matrix, player.pos); 
}

function drawMatrix(matrix, offset) { 
    matrix.forEach((row, y) => { 
        row.forEach((value, x) => { 
            if (value !== 0) { 
                context.fillStyle = COLORS[value]; 
                context.fillRect(x + offset.x, y + offset.y, 1, 1); 
                context.strokeStyle = '#000'; 
                context.lineWidth = 0.05; 
                context.strokeRect(x + offset.x, y + offset.y, 1, 1); 
            } 
        }); 
    }); 
}

function arenaSweep() { 
    let rowCount = 1; 
    outer: for (let y = arena.length - 1; y > 0; --y) { 
        for (let x = 0; x < arena[y].length; ++x) { 
            if (arena[y][x] === 0) continue outer; 
        } 
        const row = arena.splice(y, 1)[0].fill(0); 
        arena.unshift(row); 
        ++y; 
        player.score += rowCount * 10; 
        rowCount *= 2; 
    } 
    updateScore(); 
}

function collide(arena, player) { 
    const [m, o] = [player.matrix, player.pos]; 
    for (let y = 0; y < m.length; ++y) { 
        for (let x = 0; x < m[y].length; ++x) { 
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true; 
        } 
    } 
    return false; 
}

function merge(arena, player) { 
    player.matrix.forEach((row, y) => { 
        row.forEach((value, x) => { 
            if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value; 
        }); 
    }); 
}

function rotateMatrix(matrix, dir) { 
    for (let y = 0; y < matrix.length; ++y) { 
        for (let x = 0; x < y; ++x) { 
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]]; 
        } 
    } 
    if (dir > 0) matrix.forEach(row => row.reverse()); 
    else matrix.reverse(); 
}

// Funções globais para os botões mobile (no index.html) encontrarem
window.playerDrop = function() { 
    player.pos.y++; 
    if (collide(arena, player)) { 
        player.pos.y--; 
        merge(arena, player); 
        playerReset(); 
        arenaSweep(); 
    } 
    dropCounter = 0; 
}

window.fastDrop = function() { 
    while(!collide(arena, player)) player.pos.y++; 
    player.pos.y--; 
    window.playerDrop(); 
}

window.playerMove = function(dir) { 
    player.pos.x += dir; 
    if (collide(arena, player)) player.pos.x -= dir; 
}

function playerReset() { 
    const pieces = 'ILJOTSZ'; 
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]); 
    player.pos.y = 0; 
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0); 
    if (collide(arena, player)) { 
        arena.forEach(row => row.fill(0)); 
        if (player.score > highScore) { 
            highScore = player.score; 
            // Usa o saveData que já está rodando no main.js
            if(typeof saveData === 'function') saveData('pegasusTetrisRecord', highScore); 
        } 
        player.score = 0; 
        updateScore(); 
    } 
}

window.playerRotate = function(dir) { 
    const pos = player.pos.x; 
    let offset = 1; 
    rotateMatrix(player.matrix, dir); 
    while (collide(arena, player)) { 
        player.pos.x += offset; 
        offset = -(offset + (offset > 0 ? 1 : -1)); 
        if (offset > player.matrix[0].length) { 
            rotateMatrix(player.matrix, -dir); 
            player.pos.x = pos; 
            return; 
        } 
    } 
}

let dropCounter = 0; 
let dropInterval = 1000; 
let lastTime = 0; 
let highScore = (typeof getSavedData === 'function') ? (parseInt(getSavedData('pegasusTetrisRecord')) || 0) : 0;

function update(time = 0) { 
    if(typeof isSystemDestroyed !== 'undefined' && isSystemDestroyed) return; 
    const deltaTime = time - lastTime; 
    lastTime = time; 
    dropCounter += deltaTime; 
    if (dropCounter > dropInterval) window.playerDrop(); 
    draw(); 
    requestAnimationFrame(update); 
}

function updateScore() { 
    document.getElementById('score').innerText = player.score; 
    document.getElementById('high-score').innerText = highScore; 
}

const arena = []; 
let rows = 20; 
while (rows--) arena.push(new Array(12).fill(0));
const player = { pos: {x: 0, y: 0}, matrix: null, score: 0 };

// Impede que as setas rolem a página quando o Arcade estiver aberto
window.addEventListener("keydown", function(e) { 
    if(typeof isSystemDestroyed !== 'undefined' && isSystemDestroyed) return; 
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) { 
        if (document.getElementById('arcade').style.display === 'flex') e.preventDefault(); 
    } 
}, false);

// Controles do teclado
document.addEventListener('keydown', event => { 
    if (typeof isSystemDestroyed !== 'undefined' && isSystemDestroyed) return;
    if (document.getElementById('arcade').style.display !== 'flex') return; 
    
    if (event.keyCode === 37) window.playerMove(-1); 
    else if (event.keyCode === 39) window.playerMove(1); 
    else if (event.keyCode === 40) window.playerDrop(); 
    else if (event.keyCode === 38) window.playerRotate(1); 
    else if (event.keyCode === 32) window.fastDrop(); 
});

// A função mágica que o main.js chama quando você clica no "&"
window.startTetris = function() { 
    console.log("> [TETRIS_CORE] Injetado com sucesso.");
    playerReset(); 
    updateScore(); 
    update(); 
}