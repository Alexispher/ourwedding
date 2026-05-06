// =========================================================================
// PEGASUS_ENGINE // EASTER_EGGS_CORE
// =========================================================================

// 1. PEGASUS TERMINAL (Digitando "peg")
let pegStr = ""; 
let pegUsed = false;
window.addEventListener('keydown', e => {
    if(typeof isSystemDestroyed !== 'undefined' && isSystemDestroyed) return;
    if(pegUsed) return;
    if(e.key.length === 1) pegStr += e.key.toLowerCase();
    if(pegStr.endsWith('peg')) {
        pegUsed = true;
        const term = document.getElementById('peg-terminal');
        if(term) {
            term.style.display = 'block';
            term.style.opacity = 1;
            setTimeout(() => { term.style.opacity = 0; setTimeout(() => term.style.display = 'none', 1000); }, 4500);
        }
    }
});

// 2. SAVE ROOM (Clicar 3x em "A Celebração")
let saveClickCount = 0; 
let saveTimer;
window.triggerSaveRoom = function() {
    if(typeof isSystemDestroyed !== 'undefined' && isSystemDestroyed) return;
    saveClickCount++; 
    clearTimeout(saveTimer);
    if(saveClickCount >= 3) {
        saveClickCount = 0;
        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic && !bgMusic.paused) { 
            bgMusic.pause(); 
            const audioBtn = document.getElementById('audio-control');
            if(audioBtn) audioBtn.innerText = "AUDIO: OFF";
        }
        const reSom = document.getElementById('reAudio');
        if(reSom) { reSom.currentTime = 0; reSom.play().catch(e=>{}); }
        const notif = document.getElementById('save-notification');
        if(notif) { notif.style.opacity = 1; setTimeout(() => notif.style.opacity = 0, 4000); }
    }
    saveTimer = setTimeout(() => saveClickCount = 0, 1000);
}

// 3. XBOX ACHIEVEMENT (Exatos 10s c/ Fase Dupla)
let achTriggered = false;
window.triggerXboxAchievement = function() {
    if(typeof isSystemDestroyed !== 'undefined' && isSystemDestroyed) return;
    if(achTriggered) return;
    
    achTriggered = true;
    const xbSom = document.getElementById('xbAudio');
    if(xbSom) { xbSom.currentTime = 0; xbSom.play().catch(e=>{}); }

    const ach = document.getElementById('xbox-achievement');
    if(ach) {
        // Garante que inicie na Fase 1 (Troféu)
        ach.classList.remove('expanded');
        
        // A Pílula sobe na tela
        ach.classList.add('show'); 
        
        // FASE 2: Após 2.5 segundos, o ícone vira e o texto sobe
        setTimeout(() => {
            ach.classList.add('expanded');
        }, 2500);

        // FIM: Nos exatos 10 segundos, a Pílula desce e o gatilho reseta
        setTimeout(() => { 
            ach.classList.remove('show'); 
            
            setTimeout(() => { 
                ach.classList.remove('expanded'); // Reseta a Fase
                achTriggered = false; // Libera pra usar de novo
            }, 1000); 
        }, 10000); 
    }
}

// =========================================================================
// 4. SWAN LAKE CASCADE (Gatilho Duplo: Áudio x7 OU Kitana Fatality)
// =========================================================================

// GATILHO 1: Clicar 7x no botão de áudio
const audioBtnTrigger = document.getElementById('audio-control');
let audioClicks = 0;
let audioClickTimer;

if(audioBtnTrigger) {
    audioBtnTrigger.addEventListener('click', () => {
        if(typeof isSystemDestroyed !== 'undefined' && isSystemDestroyed) return;
        audioClicks++;
        clearTimeout(audioClickTimer);
        if(audioClicks >= 7) {
            audioClicks = 0;
            triggerSwanCascade();
        }
        audioClickTimer = setTimeout(() => audioClicks = 0, 2000);
    });
}

// GATILHO 2: Kitana Fatality (Baixo, Direita, Baixo)
let mk1Sequence = [];
let mk1Timer;

window.addEventListener('keydown', (e) => {
    if(typeof isSystemDestroyed !== 'undefined' && isSystemDestroyed) return;
    
    // Filtra apenas as setas direcionais para o Fatality
    if(["ArrowDown", "ArrowRight", "ArrowLeft", "ArrowUp"].includes(e.key)) {
        mk1Sequence.push(e.key);
        
        // Mantém apenas os últimos 3 inputs na memória
        if (mk1Sequence.length > 3) mk1Sequence.shift();
        
        // Checa se o input foi exatamente Baixo, Direita, Baixo
        if (mk1Sequence.join(',') === 'ArrowDown,ArrowRight,ArrowDown') {
            mk1Sequence = []; // Limpa a memória após o sucesso
            triggerSwanCascade();
        }
        
        // Se demorar mais de 1.5 segundos entre as teclas, reseta a sequência
        clearTimeout(mk1Timer);
        mk1Timer = setTimeout(() => { mk1Sequence = []; }, 1500);
    }
});

function triggerSwanCascade() {
    console.log("> [SWAN_LAKE] Efeito Cascata Iniciado.");
    const symbols = ['🦢', '🩰', '🖤', '✨'];
    
    for (let i = 0; i < 45; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.innerText = symbols[Math.floor(Math.random() * symbols.length)];
            el.style.position = 'fixed';
            el.style.zIndex = '99999';
            el.style.left = Math.random() * 95 + 'vw';
            el.style.top = '-50px';
            el.style.fontSize = (Math.random() * 25 + 20) + 'px';
            el.style.cursor = 'crosshair';
            el.style.userSelect = 'none';
            el.style.pointerEvents = 'auto'; // Permite que o usuário clique neles
            
            // Física de queda fluida: desce e roda em 3D
            el.style.transition = 'top 5s linear, transform 5s ease-in-out, opacity 5s ease-out';
            
            // Efeito interativo: estourar o cisne
            el.onclick = function() {
                this.innerText = '✨';
                this.style.transform = 'scale(1.5)';
                this.style.opacity = '0';
                setTimeout(() => this.remove(), 300);
            };

            document.body.appendChild(el);
            
            // Força o navegador a renderizar o elemento antes de aplicar a animação
            el.getBoundingClientRect();
            
            const randomRotation = (Math.random() - 0.5) * 500;
            el.style.top = '110vh';
            el.style.transform = `rotate(${randomRotation}deg) scale(${Math.random() + 0.5})`;
            
            // Faz desaparecer suavemente antes de bater no fundo
            setTimeout(() => el.style.opacity = '0', 4000); 

            // Remove do HTML depois que a animação acaba
            setTimeout(() => { if(el.parentElement) el.remove(); }, 5000);
        }, i * 150);
    }
}

// =========================================================================
// 5. FUS RO DAH (Lego Rebuild)
// =========================================================================
const pText = document.getElementById('powered-text');
let fTimer;
let fusRoDahLocked = false;

if(pText) {
    pText.addEventListener('mousedown', () => {
        if(typeof isSystemDestroyed !== 'undefined' && isSystemDestroyed) return;
        if(fusRoDahLocked) return;
        fTimer = setTimeout(() => { triggerFusRoDah(); }, 1500);
    });
    pText.addEventListener('mouseup', () => clearTimeout(fTimer));
    
    pText.addEventListener('touchstart', () => {
        if(typeof isSystemDestroyed !== 'undefined' && isSystemDestroyed) return;
        if(fusRoDahLocked) return;
        fTimer = setTimeout(() => { triggerFusRoDah(); }, 1500);
    });
    pText.addEventListener('touchend', () => clearTimeout(fTimer));
}

function triggerFusRoDah() {
    if(fusRoDahLocked) return;
    
    window.isSystemDestroyed = true; 
    fusRoDahLocked = true; 
    
    const fusSom = document.getElementById('fusAudio');
    if(fusSom) { fusSom.currentTime = 0; fusSom.play().catch(e=>{}); }
    
    const arc = document.getElementById('arcade'); 
    if(arc) arc.style.display = 'none';
    
    const elements = Array.from(document.querySelectorAll('section, header, .top-controls, .countdown-container, footer p'));
    
    setTimeout(() => {
        elements.forEach(el => {
            const randomX = (Math.random() - 0.5) * 4000;
            const randomY = (Math.random() - 0.5) * 4000;
            const randomRot = (Math.random() - 0.5) * 1080;
            el.style.transition = 'transform 2.5s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 1.5s ease-in';
            el.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRot}deg)`;
            el.style.opacity = '0'; 
            el.style.pointerEvents = 'none';
        });
        document.body.style.overflow = 'hidden';
    }, 1100); 

    setTimeout(() => {
        const overlay = document.getElementById('lego-overlay');
        if(overlay) {
            overlay.src = "assets/img/lego.gif?" + new Date().getTime(); 
            overlay.style.display = 'block';
        }
        
        const legoSom = document.getElementById('legoAudio');
        if(legoSom) { legoSom.currentTime = 0; legoSom.play().catch(e=>{}); }

        const buildTime = 2500; 
        elements.forEach((el, index) => {
            const delay = (index / elements.length) * buildTime;
            setTimeout(() => {
                el.style.transition = 'transform 0.15s steps(2, end), opacity 0.15s';
                el.style.transform = 'translate(0, 0) rotate(0deg)';
                el.style.opacity = '1'; 
                el.style.pointerEvents = 'auto';
            }, delay);
        });
        document.body.style.overflow = 'auto';
    }, 4000); 

    setTimeout(() => {
        const overlay = document.getElementById('lego-overlay');
        if(overlay) overlay.style.display = 'none';
        
        window.isSystemDestroyed = false; 
        
        if(pText) {
            pText.innerText = "System Restored (Lego Patch applied)";
            pText.style.cursor = "not-allowed"; 
            pText.style.color = "#50fa7b"; 
            pText.style.textShadow = "none";
        }
    }, 7000); 
}