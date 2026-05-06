// =========================================================================
// PEGASUS_ENGINE // FLY_SWATTER_CORE (JS)
// =========================================================================

// Escopo global para o main.js conseguir chamar a função
window.startFlySwatter = function() {
    if(document.getElementById('fly-game-container')) return;
    
    console.log("> [FLY_SWATTER] Arena iniciada.");

    const container = document.createElement('div'); 
    container.id = 'fly-game-container';
    document.body.appendChild(container);
    
    // Constrói a UI do jogo na tela
    container.innerHTML = `
        <div id="fly-score">KILLS: 0</div>
        <div class="close-fly" onclick="this.parentElement.remove(); document.body.style.cursor='auto'">X</div>
        <div id="swatter">
            <div class="swatter-head" id="hitbox"></div>
            <div class="swatter-handle"></div>
            <div class="swatter-glove">🖐🏻</div>
        </div>
    `;
    
    let score = 0; 
    let bossHealth = 15; 
    let bossSpawned = false;
    
    const scoreEl = document.getElementById('fly-score');
    const swatter = document.getElementById('swatter'); 
    const hitbox = document.getElementById('hitbox');
    
    // Segue o mouse/dedo
    function moveSwatter(x, y) { 
        swatter.style.left = (x - 30) + 'px'; 
        swatter.style.top = (y - 80) + 'px'; 
    }
    container.addEventListener('mousemove', e => moveSwatter(e.clientX, e.clientY));
    container.addEventListener('touchmove', e => { e.preventDefault(); moveSwatter(e.touches[0].clientX, e.touches[0].clientY); }, {passive: false});
    
    // Ação de bater
    function hitAction(x, y) {
        swatter.style.transform = 'rotate(-45deg) scale(0.9)';
        const hRect = hitbox.getBoundingClientRect();
        
        // Verifica hit nas moscas pequenas
        document.querySelectorAll('.fly').forEach(fly => {
            const fRect = fly.getBoundingClientRect();
            if(hRect.left < fRect.right && hRect.right > fRect.left && hRect.top < fRect.bottom && hRect.bottom > fRect.top) {
                fly.style.transition = 'none'; 
                fly.innerHTML = '💥'; 
                fly.style.fontSize = '50px'; 
                fly.style.pointerEvents = 'none';
                
                setTimeout(() => fly.remove(), 250);
                score++; 
                scoreEl.innerText = 'KILLS: ' + score + (bossSpawned ? ' (BOSS FIGHT!)' : '');
                
                if(score === 15 && !bossSpawned) spawnBoss(container);
                else if (!bossSpawned) setTimeout(() => spawnFly(container), 800);
            }
        });

        // Verifica hit no Boss
        const boss = document.querySelector('.boss-fly');
        if (boss) {
            const bRect = boss.getBoundingClientRect();
            if(hRect.left < bRect.right && hRect.right > bRect.left && hRect.top < bRect.bottom && hRect.bottom > bRect.top) {
                bossHealth--; 
                boss.style.animation = 'bossHit 0.2s infinite'; 
                boss.style.filter = 'drop-shadow(0 0 20px red) brightness(1.5)';
                
                setTimeout(() => { 
                    boss.style.animation = bossSpawned ? 'bossFloat 2s infinite ease-in-out' : ''; 
                    boss.style.filter = 'drop-shadow(0 0 10px rgba(255,0,0,0.5))'; 
                }, 200);
                
                // Morte do Boss
                if(bossHealth <= 0) {
                    boss.src = ''; 
                    boss.alt = '💥VITÓRIA!💥'; 
                    boss.style.fontSize = '30px'; 
                    boss.style.color = 'yellow'; 
                    boss.style.transform = 'translate(-50%, -50%) scale(1.5)'; 
                    boss.style.animation = 'none';
                    
                    scoreEl.innerText = 'VITÓRIA! KING WATINGA ELIMINADO!'; 
                    scoreEl.style.color = '#f1fa8c';
                    
                    setTimeout(() => { boss.remove(); }, 1500); 
                    setTimeout(() => { 
                        if(container) container.remove(); 
                        document.body.style.cursor='auto'; 
                    }, 3000);
                }
            }
        }
        setTimeout(() => swatter.style.transform = 'rotate(0deg) scale(1)', 100);
    }

    container.addEventListener('mousedown', e => hitAction(e.clientX, e.clientY));
    container.addEventListener('touchstart', e => hitAction(e.touches[0].clientX, e.touches[0].clientY));
    
    // Inicia com 6 moscas
    for(let i=0; i<6; i++) spawnFly(container);

    // Lógica do Boss
    function spawnBoss(cont) {
        bossSpawned = true; 
        const boss = document.createElement('img'); 
        boss.className = 'boss-fly'; 
        // Caminho corrigido para a pasta assets/img/
        boss.src = 'assets/img/KingWatinga.png'; 
        boss.alt = '👹'; 
        boss.style.left = '50%'; 
        boss.style.top = '30%'; 
        boss.style.animation = 'bossFloat 2s infinite ease-in-out'; 
        cont.appendChild(boss);
        
        setInterval(() => {
            if(!boss.parentElement || bossHealth <= 0) return;
            
            // Movimentação errática
            let targetX = Math.random() * (window.innerWidth - 150) + 75; 
            let targetY = Math.random() * (window.innerHeight - 150) + 75;
            boss.style.left = targetX + 'px'; 
            boss.style.top = targetY + 'px';
            
            // Ataque do boss na tela (pisca vermelho)
            if(Math.random() > 0.6) {
                cont.style.backgroundColor = 'rgba(255,0,0,0.3)'; 
                swatter.style.transition = 'all 0.15s ease-out'; 
                swatter.style.transform = 'translateY(120px) rotate(25deg)';
                setTimeout(() => { 
                    cont.style.backgroundColor = 'rgba(0,0,0,0.7)'; 
                    swatter.style.transition = 'transform 0.05s'; 
                }, 300);
            }
        }, 1200);
    }
}

// Spawner de moscas menores
function spawnFly(container) {
    if(!document.getElementById('fly-game-container')) return;
    const fly = document.createElement('div');
    fly.className = 'fly'; 
    // Caminho corrigido para a pasta assets/img/
    fly.innerHTML = '<img src="assets/img/OneGnatGA.png" alt="𓆦" style="width:100%;height:100%; object-fit:contain;">';
    
    fly.style.left = Math.random() * (window.innerWidth - 40) + 'px'; 
    fly.style.top = Math.random() * (window.innerHeight - 40) + 'px';
    container.appendChild(fly);
    
    // Atualiza posição
    setInterval(() => {
        if(!fly.parentElement || !fly.classList.contains('fly')) return;
        let currentX = parseFloat(fly.style.left) || 0; 
        let currentY = parseFloat(fly.style.top) || 0;
        
        fly.style.left = Math.max(0, Math.min(window.innerWidth - 40, currentX + (Math.random() - 0.5) * 400)) + 'px';
        fly.style.top = Math.max(0, Math.min(window.innerHeight - 40, currentY + (Math.random() - 0.5) * 400)) + 'px';
    }, 500); 
}