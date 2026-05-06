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