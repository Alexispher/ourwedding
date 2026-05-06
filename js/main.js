// === BOOT LOADER PEGASUS ===
const bootLines = [
    "> PEGASUS_FRAMEWORK v2.0.26",
    "> LOADING_KERNEL... DONE",
    "> INITIALIZING_TACTICAL_ASSETS...",
    "> SEARCHING_PLAYER_2: ANNY FOUND.",
    "> DESTINATION: BELO HORIZONTE, MG",
    "> STATUS: ALL SYSTEMS GO."
];
let bootIdx = 0;
function typeBoot() {
    if (bootIdx < bootLines.length) {
        document.getElementById('boot-text').innerHTML += `<p>${bootLines[bootIdx]}</p>`;
        bootIdx++;
        setTimeout(typeBoot, 400); 
    } else {
        setTimeout(() => {
            const loader = document.getElementById('boot-loader');
            loader.style.transition = 'opacity 0.5s';
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }, 800);
    }
}
window.onload = typeBoot;

// === PROTEÇÃO DE MEMÓRIA (THEME) ===
function getSavedData(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
function saveData(key, value) { try { localStorage.setItem(key, value); } catch(e) { console.log("Memória protegida."); } }

// === TEMA CLARO / ESCURO ===
if (getSavedData('ourwedding_theme') === 'light') { 
    document.body.setAttribute('data-theme', 'light'); 
    document.getElementById('theme-toggle').innerHTML = '☾'; 
}

document.getElementById('theme-toggle').addEventListener('click', () => {
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
});

// === ÁUDIO PRINCIPAL ===
const bgMusic = document.getElementById('bgMusic'); 
bgMusic.volume = 0.15; 
let isMusicPlaying = false;

function toggleAudio() {
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

// Desbloqueio global de áudio no primeiro clique (Política dos navegadores)
function startBgMusicGlobal(event) {
    if (isMusicPlaying) return;
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
// Casamento planejado para Março de 2028
const weddingDate = new Date("March 23, 2028 19:00:00").getTime();

function updateTimer() {
    const now = new Date().getTime(); 
    const diff = weddingDate - now;
    
    if (diff < 0) { 
        document.getElementById("timer").innerHTML = "A MISSÃO FOI CONCLUÍDA."; 
        return; 
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)); 
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); 
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById("timer").innerHTML = days + " DIAS | " + hours + " HORAS | " + mins + " MINUTOS RESTANTES";
}
updateTimer(); 
setInterval(updateTimer, 1000);

// === VERSÍCULOS ===
let verseTimeout;
window.showVerse = function(person) {
    const box = document.getElementById('verse-display'); 
    clearTimeout(verseTimeout);
    
    if (person === 'anny') {
        box.innerHTML = '"Quem encontra uma esposa encontra algo excelente; recebeu uma bênção do Senhor."<br>— Provérbios 18:22';
    } else if (person === 'alex') {
        box.innerHTML = '"Maridos, amem suas mulheres, assim como Cristo amou a igreja e entregou-se a si mesmo por ela."<br>— Efésios 5:25';
    }
    
    box.style.opacity = 1; 
    verseTimeout = setTimeout(() => { box.style.opacity = 0; }, 8000);
}

// === RSVP ===
document.getElementById('btn-rsvp').addEventListener('click', function() {
    alert('RSVP Confirmado!'); 
    this.innerHTML = 'CONFIRMADO'; 
    this.style.backgroundColor = 'var(--text-color)'; 
    this.style.color = 'var(--bg-color)';
});