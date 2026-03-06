const game = {
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas') ? document.getElementById('gameCanvas').getContext('2d') : null,
    player: null,
    zombies: [], 
    platforms: [], 
    keys: [],
    images: {}, 
    inputs: { a: false, d: false, space: false },
    active: false, 
    room: 1, 
    subRoom: 1, 
    collectedKeys: 0,
    puzzleActive: false, 
    puzzleAnswer: null,
    tries: 4, 
    startTime: 0,

    init() {
    this.canvas = document.getElementById('gameCanvas'); 
    if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1920; 
        this.canvas.height = 1080;

        const savedUser = localStorage.getItem('gameUser');
        const hudNameTag = document.getElementById('game-username-tag');
        if (savedUser && hudNameTag) {
            hudNameTag.innerText = "PLAYER: " + savedUser;
        }
        
        const assetList = {
            bg: 'image (5).png', 
            p: 'run.png', 
            z: 'zombie-walk.png', 
            d: 'door.png', 
            plat: 'plat.png'
        };

        for (let key in assetList) {
            this.images[key] = new Image();
            this.images[key].src = assetList[key];
        }

        // --- FIXED ANIMATION LOADING (Player & Zombie) ---
        const numbers = ["one", "two", "three"];
        
        numbers.forEach((num, index) => {
            const i = index + 1;
            
            // PLAYER WALK
            this.images[`walk${i}`] = new Image();
            this.images[`walk${i}`].src = `walk ${num}.png`;
            this.images[`walk${i}`].onerror = () => console.warn(`Missing: walk ${num}.png`);
            
            // PLAYER JUMPING
            this.images[`jumping${i}`] = new Image();
            this.images[`jumping${i}`].src = `jumping ${num}.png`;
            this.images[`jumping${i}`].onerror = () => console.warn(`Missing: jumping ${num}.png`);

            // PLAYER SWORD (sward)
            this.images[`sword${i}`] = new Image();
            this.images[`sword${i}`].src = `sward ${num}.png`;
            this.images[`sword${i}`].onerror = () => console.warn(`Missing: sward ${num}.png`);

            // ZOMBIE WALK (2 frames)
            if (i <= 2) {
                this.images[`zwalk${i}`] = new Image();
                this.images[`zwalk${i}`].src = `zwalk ${num}.png`;
                this.images[`zwalk${i}`].onerror = () => console.warn(`Missing: zwalk ${num}.png`);
            }

            // ZOMBIE ATTACK (3 frames)
            this.images[`zattack${i}`] = new Image();
            this.images[`zattack${i}`].src = `zattack ${num}.png`;
            this.images[`zattack${i}`].onerror = () => console.warn(`Missing: zattack ${num}.png`);
        });
        const soundList = {
            bgMusic: 'game background sound.mp3', 
            jump: 'player-jump.mp3',
            land: 'falling player.mp3',
            slash: 'swardslash.mp3',
            zDie: 'zombie dead.mp3',
            zTalk: 'zombie-sound.mp3',
            keyPop: 'key pickup.mp3'
        };

        this.sounds = {};
        for (let key in soundList) {
        this.sounds[key] = new Audio(soundList[key]);
        }


        this.sounds.bgMusic.loop = true;
        this.sounds.bgMusic.volume = 0.4;

        window.onkeydown = e => this.keysHandler(e, true);
        window.onkeyup = e => this.keysHandler(e, false);
        this.loop();
    }

    this.updateAuthUI(localStorage.getItem('gameUser'));
},
    keysHandler(e, isDown) {
        const k = e.key.toLowerCase();
        if (k === 'a') this.inputs.a = isDown; 
        if (k === 'd') this.inputs.d = isDown;
        if (e.code === 'Space') this.inputs.space = isDown;
        if (!this.puzzleActive && this.active) {
            if (isDown && k === 'f') this.performAttack();
            if (isDown && k === 'e') this.interact();
        }
    },

    triggerSplash() {
        this.active = false;
        this.toggleLayer('splash-screen');
        this.player = new Player(); 
        setTimeout(() => { 
            this.startGame('easy'); 
        }, 800);
    },

   startGame(diff) {
        this.difficulty = diff;
        this.room = 1; 
        this.subRoom = 1; 
        this.collectedKeys = 0;
        this.tries = 4;
        this.startTime = Date.now();
        if(this.sounds.bgMusic) this.sounds.bgMusic.play();
        this.active = true; 
        this.setupRoom();
        this.toggleLayer('none'); 
    },

    setupRoom() {
        this.platforms = []; this.zombies = []; this.keys = [];
        const diff = this.difficulty || 'easy';
        const roomDisplay = document.getElementById('room-id');
        if (roomDisplay) {
            roomDisplay.innerText = this.room === 1 ? "ROOM 1" : "ROOM " + this.room + " — SECTION " + this.subRoom;
        }

        // firest room
        if (this.room === 1) {
            this.zombies.push(new Zombie(600, null, false, diff), new Zombie(1000, null, false, diff));
        }  else if (this.room === 2) {
            this.player.hp = Math.min(100, this.player.hp + 15);
            if (this.subRoom === 1) this.zombies.push(new Zombie(800, null, false, diff));
            
            else if (this.subRoom === 2) {
                this.platforms.push(new Platform(300, 690, 400), new Platform(800, 400, 400));
                this.zombies.push(new Zombie(350, this.platforms[0], false, diff));
            } else if (this.subRoom === 3) {
                this.platforms.push(new Platform(800, 690, 400));
                const pKey = new Platform(1100, 400, 600);
                this.platforms.push(pKey);
                if (this.collectedKeys < 1) this.keys.push({x: 1250, y: 370, col: false});
                this.zombies.push(new Zombie(1200, pKey, false, diff));
            }
        } else if (this.room === 3) {
            if (this.subRoom === 1) {
                this.player.hp = Math.min(100, this.player.hp + 15);
                const p1 = new Platform(500, 690, 500);
                this.platforms.push(p1);
                this.zombies.push(new Zombie(600, p1, false, diff));
            } else if (this.subRoom === 2) {
                this.player.hp = Math.min(100, this.player.hp + 15);
                this.platforms.push(new Platform(400, 690, 500));
                const pBoss = new Platform(1000, 400, 700);
                this.platforms.push(pBoss);
                if (this.collectedKeys < 2) {
                    this.zombies.push(new Zombie(1100, pBoss, true, diff)); 
                    this.keys.push({x: 1200, y: 400, col: false});
                }
            }
        }
        this.updateKeyUI();
    },

    updateKeyUI() {
    const icons = document.querySelectorAll('.key-icon');
    icons.forEach((icon, index) => {
        if (index < this.collectedKeys) {
            icon.style.opacity = "1";
            icon.style.filter = "brightness(1.2) drop-shadow(0 0 10px gold)";
        } else {
            icon.style.opacity = "0.2";
            icon.style.filter = "brightness(0.2)";
        }
    });
},

    performAttack() {
        this.player.atking = true; 
        
        // PLAY SWORD SLASH
        if(this.sounds.slash) this.sounds.slash.cloneNode().play();

        setTimeout(() => { this.player.atking = false; }, 150);
        
        this.zombies.forEach(z => {
            if (z.alive && Math.abs(this.player.x - z.x) < 130 && Math.abs(this.player.y - z.y) < 180) {
                z.hp -= 40; 
                
                if (z.hp <= 0) {
                    z.alive = false;
                    if(this.sounds.zDie) this.sounds.zDie.cloneNode().play();
                }
            }
        });
    },

    interact() {
        if (this.player.x > 1600) {
            if (this.room === 1) { this.room = 2; this.subRoom = 1; this.player.x = 400; this.setupRoom(); }
            else if (this.room === 2) {
                if (this.subRoom < 3) { this.subRoom++; this.player.x = 400; this.setupRoom(); }
                else if (this.subRoom === 3) {
                    if (this.collectedKeys >= 1) { this.room = 3; this.subRoom = 1; this.player.x = 400; this.setupRoom(); }
                    else alert("DOOR LOCKED! FIND THE KEY IN SECTION 3.");
                }
            } else if (this.room === 3) {
                if (this.subRoom === 1) { this.subRoom = 2; this.player.x = 400; this.setupRoom(); }
                else if (this.subRoom === 2) { if (this.collectedKeys >= 2) this.loadPuzzle(); else alert("THE FINAL DOOR REQUIRES THE BOSS KEY!"); }
            }
        } else if (this.player.x < 350) {
            if (this.room === 3) {
                if (this.subRoom === 2) { this.subRoom = 1; this.player.x = 1500; this.setupRoom(); }
                else if (this.subRoom === 1) { this.room = 2; this.subRoom = 3; this.player.x = 1500; this.setupRoom(); }
            } else if (this.room === 2) {
                if (this.subRoom > 1) { this.subRoom--; this.player.x = 1500; this.setupRoom(); }
                else if (this.subRoom === 1) { this.room = 1; this.player.x = 1500; this.setupRoom(); }
            }
        }
    },

    async loadPuzzle() {
        document.getElementById('puzzle-layer').classList.remove('hidden');
    this.active = false; // Stop the game world
    this.puzzleActive = true;
    this.toggleLayer('puzzle-layer');
    
    const imgElement = document.getElementById('puzzle-img');
    const triesDisplay = document.getElementById('tries-count');
    if (triesDisplay) triesDisplay.innerText = this.tries;

    try {
        const r = await fetch('https://marcconrad.com/uob/banana/api.php');
        const d = await r.json();
        this.puzzleAnswer = d.solution;
        if (imgElement) imgElement.src = d.question;
    } catch(e) {
        console.error("Puzzle API failed, using fallback");
        this.puzzleAnswer = 5; // Fallback answer
        if (imgElement) imgElement.src = "fallback-puzzle.png"; 
    }
},

   checkPuzzle() {
    const input = document.getElementById('puzzle-input');
    const val = parseInt(input.value);
    
    if (val === this.puzzleAnswer) {
        alert("ACCESS GRANTED");
        this.puzzleActive = false;
        // Proceed to win screen
        const endTime = Date.now();
        const timeTaken = ((endTime - this.startTime) / 1000).toFixed(2);
        this.saveLeaderboard(timeTaken);
        this.showWinScreen(timeTaken);
    } else {
        this.tries--;
        const triesDisplay = document.getElementById('tries-count');
        if (triesDisplay) triesDisplay.innerText = this.tries;
        input.value = "";
        
        if (this.tries <= 0) {
            this.toggleLayer('menu-death');
        } else {
            alert("WRONG! ACCESS DENIED.");
        }
    }
},


loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, 1920, 1080);

    // --- PUZZLE OVERLAY CHECK ---
    if (this.puzzleActive) {
        this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, 1920, 1080);
        const hud = document.getElementById('game-hud');
        if (hud) hud.classList.add('hidden');
        requestAnimationFrame(() => this.loop());
        return; 
    }

    if (this.active) {
        // --- SAFETY CHECK: WAIT FOR PLAYER ---
        // If player isn't created yet (during splash), skip logic to prevent crash
        if (!this.player) {
            requestAnimationFrame(() => this.loop());
            return;
        }

        // --- 1. Update Game Logic ---
        this.player.update(this.inputs, this.platforms, 1080, this.sounds);

        this.zombies.forEach(z => {
            z.update(this.player.x, this.player.y, this.sounds);
            if (z.alive && Math.abs(this.player.x - z.x) < (z.isMega ? 120 : 70) && Math.abs(this.player.y - z.y) < 120) {
                this.player.hp -= z.isMega ? 1.1 : 0.5;
            }
        });

        this.keys.forEach(k => {
            if (!k.col && Math.abs((this.player.x + 55) - k.x) < 80 && this.player.y < k.y + 50 && this.player.y + this.player.h > k.y - 50) {
                k.col = true; 
                this.collectedKeys++; 
                if(this.sounds.keyPop) this.sounds.keyPop.cloneNode().play();
                this.updateKeyUI();
            }
        });

        // --- 2. DRAWING PHASE ---
        this.ctx.drawImage(this.images.bg, 0, 0, 1920, 1080);
        
        // Draw Doors
        if ((this.room === 2 && this.subRoom === 1) || (this.room === 3 && this.subRoom === 1)) {
            this.ctx.drawImage(this.images.d, 50, 580, 220, 500);
        }
        if (this.room === 1 || (this.room === 2 && this.subRoom === 3) || (this.room === 3 && this.subRoom === 2)) {
            this.ctx.drawImage(this.images.d, 1700, 580, 220, 500);
        }

        this.platforms.forEach(p => { this.ctx.drawImage(this.images.plat, p.x, p.y, p.w, 60); });
        this.zombies.forEach(z => { z.draw(this.ctx, this.images); });
        
        // Draw Player (Only if images.p is loaded)
        if (this.images.p) {
            this.player.draw(this.ctx, this.images);
        }

        this.keys.forEach(k => { 
            if (!k.col) { 
                this.ctx.font = "70px Arial"; 
                this.ctx.fillText("🔑", k.x, k.y); 
            } 
        });

        // --- 3. UI UPDATES ---
        const hpFill = document.getElementById('hp-fill');
        const hpText = document.getElementById('hp-text');
        const displayHP = Math.max(0, Math.ceil(this.player.hp));
        
        if (hpFill) hpFill.style.width = displayHP + "%";
        if (hpText) hpText.innerText = displayHP + "%";

        const canGo = (this.player.x > 1600 || (this.player.x < 350 && this.room >= 2));
        const prompt = document.getElementById('interact-prompt');
        if (prompt) prompt.classList.toggle('hidden', !canGo);

        // --- 4. DEATH CHECK ---
        if (this.player.hp <= 0) {
            this.player.hp = 0;
            this.active = false;
            const hud = document.getElementById('game-hud');
            if (hud) hud.classList.add('hidden');
            this.toggleLayer('menu-death');
        }
    }
    
    requestAnimationFrame(() => this.loop());
},

   handleAuth() {
    const user = document.getElementById('login-username').value;
    const pin = document.getElementById('login-pin').value;

    if (user.trim() !== "" && pin.trim() !== "") {
        localStorage.setItem('gameUser', user);
        // We don't need to call updateAuthUI here because we are leaving the page
        location.href = 'index.html'; 
    } else {
        alert("Enter both Username and PIN, bro!");
    }
},

    logout() {
    localStorage.removeItem('gameUser');
    // Refresh the UI immediately or redirect
    location.href = 'index.html'; 
},

   updateAuthUI(username) {
    const welcomeArea = document.getElementById('user-welcome');
    const welcomeText = document.getElementById('welcome-text');
    const loginBtn = document.getElementById('nav-login');
    const logoutBtn = document.getElementById('nav-logout');
    
    if (username) {
        const name = username.toUpperCase();
        if (welcomeText) welcomeText.innerText = "PLAYER: " + name;
        if (welcomeArea) welcomeArea.classList.remove('hidden');
        
        // LOGIN disappears, LOGOUT appears
        if (loginBtn) loginBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
        if (welcomeArea) welcomeArea.classList.add('hidden');
        
        // LOGIN appears, LOGOUT disappears
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }
},
    showWinScreen(time) {
    this.toggleLayer('menu-win');
    const stats = document.getElementById('win-stats');
    if (stats) stats.innerText = `ESCAPE TIME: ${time} SECONDS`;
    
    const list = document.getElementById('leaderboard-list');
    if (list) {
        const scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
        list.innerHTML = scores.map((s, i) => `<li>${i+1}. ${s.name} - ${s.time}s</li>`).join('');
    }
 },
 saveLeaderboard(time) {
    let scores = JSON.parse(localStorage.getItem('leaderboard')) || [];
    
    // Check localStorage directly right before saving
    const user = localStorage.getItem('gameUser') || 'ANONYMOUS';
    
    scores.push({ name: user.toUpperCase(), time: parseFloat(time) });
    scores.sort((a, b) => a.time - b.time);
    scores = scores.slice(0, 5);
    localStorage.setItem('leaderboard', JSON.stringify(scores));
},


    toggleLayer(id) {
        // Hide every single layer with the class 'ui-layer' AND 'game-overlay'
        document.querySelectorAll('.ui-layer, .game-overlay').forEach(l => {
            l.classList.add('hidden');
        });
        
        const hud = document.getElementById('game-hud');

        if (id === 'none') {
            if (hud) hud.classList.remove('hidden');
            this.active = true;
        } else {
            // If showing a menu/splash, hide the HUD
            if (hud) hud.classList.add('hidden');
            const el = document.getElementById(id);
            if (el) el.classList.remove('hidden');
            // Stop game logic while menu is up (except for splash)
            if (id !== 'splash-screen') this.active = false;
        }
    },



};

window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('gameUser');
    if (savedUser && typeof game !== 'undefined') {
        game.updateAuthUI(savedUser);
    }
});

game.init();