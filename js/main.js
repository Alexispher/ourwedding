// === PROTEÇÃO DE MEMÓRIA ===
function getSavedData(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
function saveData(key, value) { try { localStorage.setItem(key, value); } catch(e) { console.log("Memória protegida."); } }

let isSystemDestroyed = false; 

// === TEMA CLARO / ESCURO ===
if (getSavedData('ourwedding_theme') === 'light') { 
    document.body.setAttribute('data-theme', 'light'); 
    document.getElementById('theme-toggle').innerHTML = '☾'; 
}

function toggleTheme() {
    const btn = document.getElementById('theme-toggle');
    if (document.body.getAttribute('data-theme') === 'light') { 
        document.body.removeAttribute('data-theme'); 
        saveData('ourwedding_theme', 'dark'); 
        btn.innerHTML = '☀︎'; 
    } else { 
        document.body.setAttribute('data-theme', 'light'); 
        saveData('ourwedding_theme', 'light'); 
        btn.innerHTML = '☾'; 
    }
}

// === ÁUDIO PRINCIPAL ===
const bgMusic = document.getElementById('bgMusic'); 
bgMusic.volume = 0.15; 
let isMusicPlaying = false;

function toggleAudio() {
    if(isSystemDestroyed) return;
    const audioBtn = document.getElementById('audio-control');
    if (isMusicPlaying) { 
        bgMusic.pause(); 
        audioBtn.innerText = "AUDIO: OFF"; 
        audioBtn.style.color = "var(--text-muted)"; 
    } else { 
        bgMusic.play().catch(e=>{}); 
        audioBtn.innerText = "AUDIO: ON"; 
        audioBtn.style.color = "var(--dracula-purple)"; 
    }
    isMusicPlaying = !isMusicPlaying;
}

document.getElementById('audio-control').addEventListener('click', toggleAudio);

function startBgMusicGlobal(event) {
    if (isMusicPlaying || isSystemDestroyed) return;
    if (event.target.id === 'theme-toggle' || event.target.id === 'audio-control') return;
    
    bgMusic.play().then(() => { 
        isMusicPlaying = true; 
        document.getElementById('audio-control').innerText = "AUDIO: ON"; 
        document.getElementById('audio-control').style.color = "var(--dracula-purple)"; 
        document.body.removeEventListener('click', startBgMusicGlobal); 
    }).catch(e => {});
}
document.body.addEventListener('click', startBgMusicGlobal);

// === TIMER DE CONTAGEM REGRESSIVA ===
const weddingDate = new Date("March 23, 2028 19:00:00").getTime();
function updateTimer() {
    const now = new Date().getTime(); 
    const diff = weddingDate - now;
    if (diff < 0) { document.getElementById("timer").innerHTML = "A MISSÃO FOI CONCLUÍDA."; return; }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)); 
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); 
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById("timer").innerHTML = days + " DIAS | " + hours + " HORAS | " + mins + " MINUTOS RESTANTES";
}
updateTimer(); setInterval(updateTimer, 1000);

// === VERSÍCULOS ===
let verseTimeout;
window.showVerse = function(person) {
    if(isSystemDestroyed) return;
    const box = document.getElementById('verse-display'); 
    clearTimeout(verseTimeout);
    if (person === 'anny') box.innerHTML = '"Quem encontra uma esposa encontra algo excelente; recebeu uma bênção do Senhor."<br>— Provérbios 18:22';
    else if (person === 'alex') box.innerHTML = '"Maridos, amem suas mulheres, assim como Cristo amou a igreja e entregou-se a si mesmo por ela."<br>— Efésios 5:25';
    box.style.opacity = 1; verseTimeout = setTimeout(() => { box.style.opacity = 0; }, 8000);
}

// === RSVP ===
document.getElementById('btn-rsvp').addEventListener('click', function() {
    if(isSystemDestroyed) return;
    alert('RSVP Confirmado!'); 
    this.innerHTML = 'CONFIRMADO'; 
    this.style.backgroundColor = 'var(--text-color)'; 
    this.style.color = 'var(--bg-color)';
});

// =========================================================================
// === INJETOR DE CÓDIGO (LAZY LOAD DOS MINIGAMES) ===
// =========================================================================
function carregarMinigame(jsPath, cssPath, callback) {
    if (cssPath && !document.querySelector(`link[href="${cssPath}"]`)) {
        const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = cssPath; document.head.appendChild(link);
    }
    if (!document.querySelector(`script[src="${jsPath}"]`)) {
        const script = document.createElement('script'); script.src = jsPath; script.onload = callback; document.body.appendChild(script);
    } else if (callback) { callback(); }
}

// 1. TETRIS (Clicando no "&")
let gameStarted = false;
window.revealArcade = function() {
    if(isSystemDestroyed) return;
    const arc = document.getElementById('arcade'); 
    arc.style.display = 'flex'; 
    window.scrollTo({ top: arc.offsetTop, behavior: 'smooth' });
    
    if (!gameStarted) {
        carregarMinigame('js/tetris.js', 'CSS/tetris.css', () => {
            if(window.startTetris) window.startTetris();
            gameStarted = true;
        });
    }
}

// 2. BRAINZ (Digitando "brain")
let brainzStr = ""; let brainzUsed = false;
window.addEventListener('keydown', e => {
    if(isSystemDestroyed || brainzUsed) return;
    if(e.key.length === 1) brainzStr += e.key.toLowerCase();
    if(brainzStr.endsWith('brain')) {
        brainzUsed = true;
        console.log("> [SYSTEM] Senha 'BRAIN' detectada. Iniciando protocolo zumbi...");
        carregarMinigame('js/brainz.js', 'CSS/brainz.css', () => {
            if(window.startBrainz) window.startBrainz();
        });
    }
});

// 3. MALETA RE4 (20 Scrolls)
let scrollChanges = 0; let lastScrollPos = window.scrollY; let lastScrollDirection = 0; let scrollResetTimer;
window.addEventListener('scroll', () => {
    if (isSystemDestroyed || document.getElementById('attache-case-overlay').style.display === 'flex') return;
    let currentScrollPos = window.scrollY;
    if (Math.abs(currentScrollPos - lastScrollPos) < 10) return; 
    let currentDirection = currentScrollPos > lastScrollPos ? 1 : -1;
    if (lastScrollDirection !== 0 && currentDirection !== lastScrollDirection) scrollChanges++;
    lastScrollDirection = currentDirection; lastScrollPos = currentScrollPos;
    clearTimeout(scrollResetTimer);
    if (scrollChanges >= 20) { 
        scrollChanges = 0; 
        carregarMinigame('js/re4_inventory.js', 'CSS/re4_inventory.css', () => {
            if(window.openAttacheCase) window.openAttacheCase();
        });
    }
    scrollResetTimer = setTimeout(() => { scrollChanges = 0; }, 600);
});

// 4. FLY SWATTER (Clicando no botão de tema 6x)
const themeBtn = document.getElementById('theme-toggle');
let themeClicks = 0; let themeTimer;
themeBtn.addEventListener('click', () => {
    if(isSystemDestroyed) return;
    toggleTheme(); themeClicks++; clearTimeout(themeTimer);
    if(themeClicks >= 6) { 
        themeClicks = 0; 
        carregarMinigame('js/fly_swatter.js', 'CSS/fly_swatter.css', () => {
            if(window.startFlySwatter) window.startFlySwatter();
        });
    }
    themeTimer = setTimeout(() => themeClicks = 0, 1500);
});

// =========================================================================
// === PEQUENOS EASTER EGGS NATIVOS ===
// =========================================================================

// PEGASUS TERMINAL (Digitando "peg")
let pegStr = ""; let pegUsed = false;
window.addEventListener('keydown', e => {
    if(isSystemDestroyed || pegUsed) return;
    if(e.key.length === 1) pegStr += e.key.toLowerCase();
    if(pegStr.endsWith('peg')) {
        pegUsed = true;
        const term = document.getElementById('peg-terminal');
        term.style.display = 'block';
        setTimeout(() => { term.style.opacity = 0; setTimeout(() => term.style.display = 'none', 1000); }, 4500);
    }
});

// SAVE ROOM RE (Clicando "A Celebração" 3x)
let saveClickCount = 0; let saveTimer;
window.triggerSaveRoom = function() {
    if(isSystemDestroyed) return;
    saveClickCount++; clearTimeout(saveTimer);
    if(saveClickCount >= 3) {
        saveClickCount = 0;
        if (isMusicPlaying) { bgMusic.pause(); isMusicPlaying = false; document.getElementById('audio-control').innerText = "AUDIO: OFF"; document.getElementById('audio-control').style.color = "var(--text-muted)"; }
        const reSom = document.getElementById('reAudio');
        reSom.currentTime = 0; reSom.play().catch(e=>{});
        const notif = document.getElementById('save-notification');
        notif.style.opacity = 1; setTimeout(() => notif.style.opacity = 0, 4000);
    }
    saveTimer = setTimeout(() => saveClickCount = 0, 1000);
}

// XBOX ACHIEVEMENT (Clicando no ponto final do footer)
let achTriggered = false;
window.triggerXboxAchievement = function() {
    if(isSystemDestroyed || achTriggered) return;
    achTriggered = true;
    const xbSom = document.getElementById('xbAudio');
    xbSom.currentTime = 0; xbSom.play().catch(e=>{});
    const ach = document.getElementById('xbox-achievement');
    ach.classList.add('show'); setTimeout(() => ach.classList.remove('show'), 6000); 
}

// FUS RO DAH + LEGO REBUILD (Segurando clique em "Powered by...")
const poweredText = document.getElementById('powered-text');
let fusTimer; let fusRoDahLocked = false;
if(poweredText) {
    ['mousedown', 'touchstart'].forEach(evt => {
        poweredText.addEventListener(evt, () => {
            if(isSystemDestroyed || fusRoDahLocked) return;
            fusTimer = setTimeout(() => triggerFusRoDah(), 1500); 
        });
    });
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt => {
        poweredText.addEventListener(evt, () => clearTimeout(fusTimer));
    });
}

function triggerFusRoDah() {
    if(fusRoDahLocked) return;
    isSystemDestroyed = true; fusRoDahLocked = true; 
    const fusSom = document.getElementById('fusAudio');
    fusSom.currentTime = 0; fusSom.play().catch(e=>{});
    const arc = document.getElementById('arcade'); if(arc) arc.style.display = 'none';
    
    const elements = Array.from(document.querySelectorAll('section, header, .top-controls, .countdown-container, footer p'));
    setTimeout(() => {
        elements.forEach(el => {
            const randomX = (Math.random() - 0.5) * 4000;
            const randomY = (Math.random() - 0.5) * 4000;
            const randomRot = (Math.random() - 0.5) * 1080;
            el.style.transition = 'transform 2.5s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 1.5s ease-in';
            el.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRot}deg)`;
            el.style.opacity = '0'; el.style.pointerEvents = 'none';
        });
        document.body.style.overflow = 'hidden';
    }, 1100); 

    setTimeout(() => {
        const overlay = document.getElementById('lego-overlay');
        overlay.src = "assets/img/lego.gif?" + new Date().getTime(); 
        overlay.style.display = 'block';
        const legoSom = document.getElementById('legoAudio');
        legoSom.currentTime = 0; legoSom.play().catch(e=>{});

        const buildTime = 2500; 
        elements.forEach((el, index) => {
            const delay = (index / elements.length) * buildTime;
            setTimeout(() => {
                el.style.transition = 'transform 0.15s steps(2, end), opacity 0.15s';
                el.style.transform = 'translate(0, 0) rotate(0deg)';
                el.style.opacity = '1'; el.style.pointerEvents = 'auto';
            }, delay);
        });
        document.body.style.overflow = 'auto';
    }, 4000); 

    setTimeout(() => {
        document.getElementById('lego-overlay').style.display = 'none';
        isSystemDestroyed = false; 
        if(poweredText) {
            poweredText.innerText = "System Restored (Lego Patch applied)";
            poweredText.style.cursor = "not-allowed"; poweredText.style.color = "#50fa7b"; poweredText.style.textShadow = "none";
        }
    }, 7000); 
}