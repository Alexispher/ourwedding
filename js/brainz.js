// =========================================================================
// PEGASUS_ENGINE // BRAINZ_CORE (JS)
// =========================================================================

window.startBrainz = function() {
    if(document.getElementById('brainz-container')) return;

    const container = document.createElement('div');
    container.id = 'brainz-container';
    document.body.appendChild(container);

    container.innerHTML = `
        <div id="damage-overlay"></div>
        <div id="laser-dot"></div>
        <div id="brainz-ui" style="display:none;">
            <div id="bz-hp">HP: 100%</div>
            <div id="bz-horde" style="text-align:center;">The Dead Farm<br><span style="font-size:16px;">Horde 1</span></div>
            <div id="bz-ammo">Ammo: ∞</div>
        </div>
        <img id="player-gun" src="assets/brainz/point.png" style="display:none;">
        
        <div id="screen-menu" class="brainz-screen">
            <div class="brainz-title">BRAINZ</div>
            <input type="text" id="player-name-input" maxlength="5" placeholder="NAME" autocomplete="off">
            <div style="display:flex;">
                <button class="brainz-btn" id="btn-start">Start New Try</button>
                <button class="brainz-btn" id="btn-escape">Escape</button>
            </div>
            
            <div id="leaderboard-wrapper" class="leaderboard-section">
                <h3 style="color:#ff0000; letter-spacing:3px;">RANKING // SURVIVORS</h3>
                
                <div class="diff-header">💀 Madness</div>
                <div id="lb-hard"></div>
                
                <div class="diff-header">🧠 Lobotomize 'Em</div>
                <div id="lb-med"></div>
                
                <div class="diff-header">🍼 Get Soft On Me</div>
                <div id="lb-easy"></div>
            </div>
        </div>

        <div id="screen-diff" class="brainz-screen" style="display:none;">
            <div class="brainz-title">CHOOSE YOUR FATE</div>
            <button class="brainz-btn" data-diff="easy">🍼 Get Soft On Me</button>
            <button class="brainz-btn" data-diff="med">🧠 Lobotomize 'Em</button>
            <button class="brainz-btn" data-diff="hard">💀 Madness</button>
        </div>

        <div id="screen-over" class="brainz-screen" style="display:none;">
            <div class="brainz-title" id="over-msg" style="font-size: 60px;">THEY ATE YOU</div>
            <p id="over-stats" style="font-size:20px; color:#aaa; margin-bottom: 30px;"></p>
            <button class="brainz-btn" id="btn-menu">Back to Menu</button>
        </div>
    `;

    // --- VARIÁVEIS ---
    let gameState = 'menu', diff = 'easy', playerName = 'P1';
    let spawnInterval, bleedInterval, zombies = [];
    let hp = 100, ammo = 0, isBleeding = false;
    let stats = { time: 0, damageTaken: 0, shotsFired: 0, kills: 0, startTime: 0 };
    let hordeIndex = 1, currentArea = 1, zombiesToSpawn = 0;

    const DIFF_MODS = {
        easy: { dmgIn: 0.5, hpOut: 0.8, startAmmo: '∞', spawnRate: 1500, label: "Get Soft On Me" },
        med:  { dmgIn: 1.0, hpOut: 1.0, startAmmo: 25, spawnRate: 1200, label: "Lobotomize 'Em" },
        hard: { dmgIn: 1.5, hpOut: 1.5, startAmmo: 15, spawnRate: 900, label: "Madness" }
    };

    const Z_DATA = {
        '1':  { src: '1.png', hp: 2, dmg: 10, speed: 0.003, scaleStart: 0.1 },
        '2':  { src: '2.png', hp: 2, dmg: 10, speed: 0.0035, scaleStart: 0.1 },
        '3':  { src: '3.png', hp: 2, dmg: 10, speed: 0.0032, scaleStart: 0.1 },
        '4':  { src: '4.png', hp: 6, dmg: 25, speed: 0.002, scaleStart: 0.15 }, 
        '5':  { src: '5.png', hp: 1, dmg: 15, speed: 0.005, scaleStart: 0.1 },  
        '6':  { src: '6.png', hp: 3, dmg: 12, speed: 0.003, scaleStart: 0.1 },
        '7':  { src: '7.png', hp: 3, dmg: 12, speed: 0.003, scaleStart: 0.1 },
        '8':  { src: '8_boss.png', hp: 25, dmg: 40, speed: 0.0015, scaleStart: 0.2, isBoss: true },
        '9':  { src: '9_rare.png', hp: 1, dmg: 0, speed: 0.008, scaleStart: 0.1, isRare: true }, 
        '10': { src: '10.png', hp: 4, dmg: 20, speed: 0.0025, scaleStart: 0.12 },
        '11': { src: '11.png', hp: 2, dmg: 5, speed: 0.0035, scaleStart: 0.1, causesBleed: true },
        '12': { src: '12_boss.png', hp: 40, dmg: 50, speed: 0.0035, scaleStart: 0.2, isBoss: true }, 
        '13': { src: '13.png', hp: 10, dmg: 30, speed: 0.004, scaleStart: 0.15 } 
    };

    // --- CONTROLES ---
    const laser = document.getElementById('laser-dot');
    const gun = document.getElementById('player-gun');
    
    container.addEventListener('mousemove', e => {
        laser.style.left = e.clientX + 'px';
        laser.style.top = e.clientY + 'px';
        if(gameState === 'playing') {
            const rot = ((e.clientX / window.innerWidth) - 0.5) * 15;
            gun.style.transform = `rotate(${rot}deg)`;
        }
    });

    container.addEventListener('mousedown', e => {
        if(gameState !== 'playing') return;
        if(diff !== 'easy' && ammo <= 0) return; 
        
        gun.src = 'assets/brainz/shot.png';
        setTimeout(() => { if(gameState==='playing') gun.src = 'assets/brainz/point.png'; }, 80);
        
        if(diff !== 'easy') ammo--;
        stats.shotsFired++;
        updateUI();

        let hitZombie = null;
        for(let i = zombies.length - 1; i >= 0; i--) {
            const zRect = zombies[i].el.getBoundingClientRect();
            if(e.clientX >= zRect.left && e.clientX <= zRect.right && e.clientY >= zRect.top && e.clientY <= zRect.bottom) {
                hitZombie = zombies[i]; break;
            }
        }
        
        if(hitZombie) {
            hitZombie.currentHp--;
            hitZombie.el.style.filter = 'brightness(2) drop-shadow(0 0 10px red)';
            setTimeout(() => { if(hitZombie.el) hitZombie.el.style.filter = 'drop-shadow(0 0 15px rgba(0,0,0,0.8))'; }, 100);
            
            if(hitZombie.currentHp <= 0) {
                stats.kills++;
                if(hitZombie.type === '9') ammo = diff === 'easy' ? '∞' : ammo + 30; 
                else if(diff !== 'easy' && Math.random() < 0.3) ammo += Math.floor(Math.random() * 3) + 1; 
                
                hitZombie.el.remove();
                zombies = zombies.filter(z => z !== hitZombie);
                
                if(hitZombie.type === '8') { currentArea = 2; hordeIndex = 1; changeArea(); startHorde(); }
                else if(hitZombie.type === '12') gameOver('VICTORY! YOU SURVIVED!');
            }
        }
    });

    function changeArea() {
        container.style.backgroundImage = currentArea === 1 ? "url('assets/brainz/bg_area_1.png')" : "url('assets/brainz/bg_area_2.png')";
    }

    function startHorde() {
        if(gameState !== 'playing') return;
        let pool = [];
        if(currentArea === 1) {
            if(hordeIndex === 1) { zombiesToSpawn = 5; pool = ['1','2','3']; }
            else if(hordeIndex === 2) { zombiesToSpawn = 10; pool = ['1','2','3','4','5']; }
            else if(hordeIndex === 3) { zombiesToSpawn = 15; pool = ['1','2','3','4','5','6','7']; }
            else { spawnBoss('8'); return; }
        } else {
            if(hordeIndex === 1) { zombiesToSpawn = 20; pool = ['1','2','3','10','11']; }
            else if(hordeIndex === 2) { zombiesToSpawn = 30; pool = ['10','11','13']; }
            else { spawnBoss('12'); return; }
        }
        updateUI();
        
        spawnInterval = setInterval(() => {
            if(gameState !== 'playing') return clearInterval(spawnInterval);
            if(zombiesToSpawn > 0) {
                let type = pool[Math.floor(Math.random() * pool.length)];
                if(type === '4' && Math.random() > 0.25) type = '1'; 
                if(type === '13' && Math.random() > 0.30) type = '10'; 
                if(Math.random() <= 0.01) type = '9'; 
                createZombie(type); zombiesToSpawn--;
            } else if (zombies.length === 0) {
                clearInterval(spawnInterval); hordeIndex++; setTimeout(startHorde, 2000);
            }
        }, DIFF_MODS[diff].spawnRate); 
    }

    function spawnBoss(type) { zombiesToSpawn = 0; createZombie(type); updateUI(); }

    function createZombie(type) {
        const data = Z_DATA[type];
        const el = document.createElement('img');
        el.src = `assets/brainz/${data.src}`;
        el.className = 'zombie-sprite';
        const targetXOffset = (Math.random() - 0.5) * 60; 
        const zObj = {
            el: el, type: type, currentHp: Math.ceil(data.hp * DIFF_MODS[diff].hpOut),
            baseDmg: data.dmg * DIFF_MODS[diff].dmgIn, progress: 0, targetXOffset: targetXOffset,
            speed: data.speed, data: data
        };
        zombies.push(zObj); container.appendChild(el);
    }

    function gameLoop() {
        if(gameState !== 'playing') return;
        zombies.forEach((z, index) => {
            z.progress += z.speed;
            if(z.type === '8' && Math.random() < 0.02) {
                 z.targetXOffset += (Math.random() > 0.5 ? 25 : -25);
                 z.targetXOffset = Math.max(-40, Math.min(40, z.targetXOffset));
            }
            let currentScale = z.data.scaleStart + (z.progress * 2.0); 
            let currentBottom = 45 - (z.progress * 45); 
            let currentLeft = 50 + (z.targetXOffset * z.progress); 
            z.el.style.transform = `translateX(-50%) scale(${currentScale})`;
            z.el.style.left = currentLeft + '%'; z.el.style.bottom = currentBottom + '%';
            z.el.style.zIndex = Math.floor(z.progress * 100) + 40010;
            if(z.progress >= 1.0) { takeDamage(z.baseDmg, z.type); z.el.remove(); zombies.splice(index, 1); }
        });
        requestAnimationFrame(gameLoop);
    }

    function takeDamage(amount, type) {
        hp -= amount; stats.damageTaken += amount;
        const dmgScr = document.getElementById('damage-overlay');
        dmgScr.style.opacity = 1; setTimeout(() => dmgScr.style.opacity = 0, 200);
        updateUI();
        if(type === '11' && !isBleeding) {
            isBleeding = true; let bleedTicks = 0; let bleedDmg = diff === 'easy' ? 1 : (diff === 'med' ? 2 : 3);
            bleedInterval = setInterval(() => {
                hp -= bleedDmg; updateUI(); bleedTicks++;
                if(bleedTicks >= 3 || hp <= 0) { clearInterval(bleedInterval); isBleeding = false; checkDeath('11'); }
            }, 1000);
        }
        checkDeath(type);
    }

    function checkDeath(killerType) {
        if(hp <= 0) {
            hp = 0; updateUI();
            let msg = killerType === '8' ? "HE ATE YOU" : (killerType === '12' ? "SHE ATE YOU" : "THEY ATE YOU");
            gameOver(msg);
        }
    }

    function updateUI() {
        document.getElementById('bz-hp').innerText = `HP: ${Math.floor(hp)}%`;
        document.getElementById('bz-ammo').innerText = `Ammo: ${ammo}`;
        let areaName = currentArea === 1 ? "The Dead Farm" : "Abandoned Graveyard";
        let phase = currentArea === 1 ? (hordeIndex <= 3 ? `Horde ${hordeIndex}` : 'BOSS') : (hordeIndex <= 2 ? `Horde ${hordeIndex}` : 'FINAL BOSS');
        document.getElementById('bz-horde').innerHTML = `${areaName}<br><span style="font-size:16px; color:#c0c0c0;">${phase}</span>`;
    }

    function startGame() {
        document.getElementById('screen-diff').style.display = 'none';
        document.getElementById('brainz-ui').style.display = 'flex';
        gun.style.display = 'block'; hp = 100;
        ammo = DIFF_MODS[diff].startAmmo; currentArea = 1; hordeIndex = 1;
        stats = { time: 0, damageTaken: 0, shotsFired: 0, kills: 0, startTime: Date.now() };
        zombies.forEach(z => z.el.remove()); zombies = [];
        gameState = 'playing'; changeArea(); updateUI(); startHorde(); requestAnimationFrame(gameLoop);
    }

    function gameOver(msg) {
        gameState = 'over'; clearInterval(spawnInterval); clearInterval(bleedInterval);
        gun.style.display = 'none'; document.getElementById('brainz-ui').style.display = 'none';
        stats.time = Math.floor((Date.now() - stats.startTime) / 1000);
        if(msg.includes('VICTORY')) saveScore();
        document.getElementById('over-msg').innerText = msg;
        document.getElementById('over-stats').innerText = `TIME: ${stats.time}s | KILLS: ${stats.kills} | SHOTS: ${stats.shotsFired}`;
        document.getElementById('screen-over').style.display = 'flex';
    }

    // --- LEADERBOARD ---
    function loadLeaderboard() {
        let board = JSON.parse(getSavedData('brainz_lb')) || [];
        const sections = {
            hard: { el: document.getElementById('lb-hard'), msg: "Absolute madness. No human has conquered this hell yet." },
            med:  { el: document.getElementById('lb-med'), msg: "Are your brains all rotten? No one survived this yet." },
            easy: { el: document.getElementById('lb-easy'), msg: "Not even a crybaby finished this? Pathetic." }
        };

        ['hard', 'med', 'easy'].forEach(d => {
            let filtered = board.filter(b => b.diff === d).slice(0, 5);
            if(filtered.length === 0) {
                sections[d].el.innerHTML = `<p class="empty-msg">${sections[d].msg}</p>`;
            } else {
                let html = `<table class="leaderboard-table"><tr><th>RNK</th><th>NAME</th><th>TIME</th><th>KILLS</th></tr>`;
                filtered.forEach((b, i) => {
                    html += `<tr><td>#${i+1}</td><td>${b.name}</td><td>${b.time}s</td><td>${b.kills}</td></tr>`;
                });
                html += `</table>`;
                sections[d].el.innerHTML = html;
            }
        });
    }

    function saveScore() {
        let board = JSON.parse(getSavedData('brainz_lb')) || [];
        board.push({ name: playerName || 'P1', time: stats.time, kills: stats.kills, diff: diff });
        const diffOrder = { hard: 3, med: 2, easy: 1 };
        board.sort((a,b) => (diffOrder[b.diff] - diffOrder[a.diff]) || (b.kills - a.kills) || (a.time - b.time));
        if(typeof saveData === 'function') saveData('brainz_lb', JSON.stringify(board));
    }

    // --- EVENTOS ---
    document.getElementById('btn-start').addEventListener('click', () => {
        playerName = document.getElementById('player-name-input').value.toUpperCase().trim().substring(0,5);
        document.getElementById('screen-menu').style.display = 'none';
        document.getElementById('screen-diff').style.display = 'flex';
    });

    document.getElementById('btn-escape').addEventListener('click', () => {
        container.remove(); document.body.style.cursor = 'auto'; brainzUsed = false; 
    });

    document.getElementById('btn-menu').addEventListener('click', () => {
        document.getElementById('screen-over').style.display = 'none';
        document.getElementById('screen-menu').style.display = 'flex';
        zombies.forEach(z => z.el.remove()); zombies = []; loadLeaderboard();
    });

    document.querySelectorAll('[data-diff]').forEach(btn => {
        btn.addEventListener('click', e => {
            diff = e.target.getAttribute('data-diff'); startGame();
        });
    });

    loadLeaderboard(); 
}