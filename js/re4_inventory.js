// =========================================================================
// PEGASUS_ENGINE // ATTACHE_CASE_CORE (JS)
// =========================================================================

const GRID_SIZE = 40;
const GRID_W = 10; // Espaço curto!
const GRID_H = 7;
let gridMap = [];
let wasMusicPlayingBeforeCase = false; // Guarda o estado da música

// Inventário baseado nos arquivos fornecidos
const itemsData = [
    { id: 1, src: 'assets/REi/RE4R_CQBR_Assault_Rifle.png', w: 7, h: 2 },
    { id: 2, src: 'assets/REi/image.png', w: 7, h: 2 }, // Suposta Shotgun
    { id: 3, src: 'assets/REi/image_1.png', w: 6, h: 2 }, // Suposto Rifle/AR
    { id: 4, src: 'assets/REi/RE4R_TMP.png', w: 3, h: 2 },
    { id: 5, src: 'assets/REi/Bio_Resu_Combat_Knife - Copia.png', w: 1, h: 3 },
    { id: 6, src: 'assets/REi/Bio_resu_first_aid_spray.png', w: 1, h: 2 },
    { id: 7, src: 'assets/REi/RE4R_Magnum_Ammo.png', w: 2, h: 1 },
    { id: 8, src: 'assets/REi/RE4R_Rifle_Ammo.png', w: 2, h: 1 },
    { id: 9, src: 'assets/REi/RE4R_Shotgun_Shells.png', w: 2, h: 1 },
    { id: 10, src: 'assets/REi/RE4R_Submachine_Gun_Ammo.png', w: 2, h: 1 }
];

function initGridMap() { 
    gridMap = Array(GRID_H).fill().map(() => Array(GRID_W).fill(null)); 
}

// Verifica colisão e bordas
function canPlace(x, y, w, h, ignoreId = null) {
    if (x < 0 || y < 0 || x + w > GRID_W || y + h > GRID_H) return false;
    for (let i = y; i < y + h; i++) {
        for (let j = x; j < x + w; j++) {
            if (gridMap[i][j] !== null && gridMap[i][j] !== ignoreId) return false;
        }
    }
    return true;
}

function placeInGrid(id, x, y, w, h) {
    for (let i = y; i < y + h; i++) {
        for (let j = x; j < x + w; j++) { gridMap[i][j] = id; }
    }
}

function removeFromGrid(id) {
    for (let i = 0; i < GRID_H; i++) {
        for (let j = 0; j < GRID_W; j++) {
            if (gridMap[i][j] === id) gridMap[i][j] = null;
        }
    }
}

window.openAttacheCase = function() {
    // 1. SILÊNCIO ABSOLUTO (Regra Tática)
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic && !bgMusic.paused) {
        wasMusicPlayingBeforeCase = true;
        bgMusic.pause();
    } else {
        wasMusicPlayingBeforeCase = false;
    }

    const overlay = document.getElementById('attache-case-overlay'); 
    const grid = document.getElementById('attache-case-grid');
    
    // Cria a lixeira se não existir
    if(!document.getElementById('re4-trash')) {
        const trash = document.createElement('div');
        trash.id = 're4-trash';
        trash.innerHTML = '🗑️ ARRASTAR AQUI PARA DESCARTAR';
        overlay.appendChild(trash);
    }

    overlay.style.display = 'flex'; 
    grid.innerHTML = '';
    initGridMap();

    // Auto-organizador (Tenta colocar os itens se couberem)
    itemsData.forEach(data => {
        const img = document.createElement('img'); 
        img.src = data.src; 
        img.className = 're4-item';
        img.style.width = (data.w * GRID_SIZE) + 'px'; 
        img.style.height = (data.h * GRID_SIZE) + 'px';
        img.draggable = false;
        
        let placed = false;
        for (let y = 0; y < GRID_H && !placed; y++) {
            for (let x = 0; x < GRID_W && !placed; x++) {
                if (canPlace(x, y, data.w, data.h)) {
                    placeInGrid(data.id, x, y, data.w, data.h);
                    img.style.left = (x * GRID_SIZE) + 'px'; 
                    img.style.top = (y * GRID_SIZE) + 'px';
                    placed = true;
                }
            }
        }
        
        // Se não couber, não spawna (punição do inventário cheio)
        if(placed) {
            img.dataset.id = data.id; 
            img.dataset.rotated = "false"; 
            img.dataset.slotsW = data.w; 
            img.dataset.slotsH = data.h;
            makeDraggable(img, grid); 
            grid.appendChild(img);
        }
    });
}

// Fechar e voltar a música
window.closeAttacheCase = function() { 
    document.getElementById('attache-case-overlay').style.display = 'none'; 
    
    // Devolve o som se estava tocando antes
    if (wasMusicPlayingBeforeCase) {
        const bgMusic = document.getElementById('bgMusic');
        bgMusic.play().catch(e => {});
    }
}

function makeDraggable(el, container) {
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
    let isDragging = false, lastTap = 0;
    let initialGridX = 0, initialGridY = 0;
    const trashZone = document.getElementById('re4-trash');

    el.addEventListener('mousedown', dragStart); 
    el.addEventListener('touchstart', dragStart, {passive: false});

    function dragStart(e) {
        e.preventDefault();
        
        // Clique rápido = Rotacionar
        const tapLength = new Date().getTime() - lastTap;
        if (tapLength < 300 && tapLength > 0) { rotateItem(el); return; }
        lastTap = new Date().getTime();
        
        isDragging = true;
        if (e.type === 'touchstart') { startX = e.touches[0].clientX; startY = e.touches[0].clientY; } 
        else { startX = e.clientX; startY = e.clientY; }
        
        initialLeft = parseInt(el.style.left, 10) || 0; 
        initialTop = parseInt(el.style.top, 10) || 0;
        initialGridX = Math.round(initialLeft / GRID_SIZE); 
        initialGridY = Math.round(initialTop / GRID_SIZE);

        document.addEventListener('mousemove', dragMove); 
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', dragMove, {passive: false}); 
        document.addEventListener('touchend', dragEnd);
    }

    function dragMove(e) {
        if (!isDragging) return; 
        e.preventDefault();
        let currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        let currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        // Responsividade para mobile
        let scale = window.innerWidth <= 768 ? 0.8 : 1;
        el.style.left = (initialLeft + (currentX - startX)/scale) + 'px'; 
        el.style.top = (initialTop + (currentY - startY)/scale) + 'px';

        // Feedback visual da lixeira
        const tRect = trashZone.getBoundingClientRect();
        if(currentX > tRect.left && currentX < tRect.right && currentY > tRect.top && currentY < tRect.bottom) {
            trashZone.classList.add('drag-over');
        } else {
            trashZone.classList.remove('drag-over');
        }
    }

    function dragEnd(e) {
        isDragging = false;
        document.removeEventListener('mousemove', dragMove); 
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', dragMove); 
        document.removeEventListener('touchend', dragEnd);
        
        let id = parseInt(el.dataset.id);
        trashZone.classList.remove('drag-over');

        // LÓGICA DE DESCARTE (LIXEIRA)
        let endX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
        let endY = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;
        const tRect = trashZone.getBoundingClientRect();
        
        if(endX > tRect.left && endX < tRect.right && endY > tRect.top && endY < tRect.bottom) {
            removeFromGrid(id); // Limpa da matriz
            el.remove(); // Destrói o elemento HTML
            return; // Encerra a função
        }

        // LÓGICA DE GRID (COLISÃO)
        let currentLeft = parseInt(el.style.left, 10); 
        let currentTop = parseInt(el.style.top, 10);
        let targetGridX = Math.round(currentLeft / GRID_SIZE); 
        let targetGridY = Math.round(currentTop / GRID_SIZE);
        
        let w = el.dataset.rotated === "true" ? parseInt(el.dataset.slotsH) : parseInt(el.dataset.slotsW);
        let h = el.dataset.rotated === "true" ? parseInt(el.dataset.slotsW) : parseInt(el.dataset.slotsH);

        // Verifica se pode soltar ali
        if (canPlace(targetGridX, targetGridY, w, h, id)) {
            removeFromGrid(id);
            el.style.left = (targetGridX * GRID_SIZE) + 'px'; 
            el.style.top = (targetGridY * GRID_SIZE) + 'px';
            placeInGrid(id, targetGridX, targetGridY, w, h);
        } else {
            // Se bater em outra arma ou sair da borda, volta pra origem
            el.style.left = (initialGridX * GRID_SIZE) + 'px'; 
            el.style.top = (initialGridY * GRID_SIZE) + 'px';
        }
    }
}

// Rotação (2 Cliques Rápidos)
function rotateItem(el) {
    let id = parseInt(el.dataset.id);
    let currentX = Math.round(parseInt(el.style.left, 10) / GRID_SIZE);
    let currentY = Math.round(parseInt(el.style.top, 10) / GRID_SIZE);
    let isRotated = el.dataset.rotated === "true";
    
    let originalW = parseInt(el.dataset.slotsW); 
    let originalH = parseInt(el.dataset.slotsH);
    let currentW = isRotated ? originalH : originalW; 
    let currentH = isRotated ? originalW : originalH;
    
    let newW = currentH; 
    let newH = currentW;

    // Só permite girar se tiver espaço vazio ao redor
    if (canPlace(currentX, currentY, newW, newH, id)) {
        removeFromGrid(id);
        if (!isRotated) { 
            el.style.transform = `rotate(90deg) translateY(-100%)`; 
            el.dataset.rotated = "true"; 
        } else { 
            el.style.transform = "rotate(0deg) translateY(0)"; 
            el.dataset.rotated = "false"; 
        }
        placeInGrid(id, currentX, currentY, newW, newH);
    }
}

console.log("> [RE4_INVENTORY] Carregado e operante.");