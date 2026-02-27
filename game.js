const game = {
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d'),
    player: new Player(),
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
        this.canvas.width = 1920; 
        this.canvas.height = 1080;
        const assets = { 
            bg: 'image (5).png', 
            p: 'run.png', 
            z: 'zombie-walk.png', 
            d: 'door.png',
            plat: 'plat.png'
        };
        for (let k in assets) { 
            this.images[k] = new Image(); 
            this.images[k].src = assets[k]; 
        }
        window.onkeydown = e => this.keysHandler(e, true);
        window.onkeyup = e => this.keysHandler(e, false);
        
        this.updateAuthUI(localStorage.getItem('gameUser'));
        
        this.toggleLayer('menu-main');
        this.loop();
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
        this.toggleLayer('splash-screen');
        setTimeout(() => { 
            this.startGame('easy'); 
        }, 600);
    },

    startGame(diff) {
        this.difficulty = diff;
        this.toggleLayer('none');
        document.getElementById('game-hud').classList.remove('hidden');
        this.active = true; 
        this.room = 1; 
        this.subRoom = 1; 
        this.collectedKeys = 0;
        this.player = new Player();
        this.setupRoom();
        this.startTime = Date.now();
    },

    setupRoom() {
        this.platforms = []; 
        this.zombies = []; 
        this.keys = [];
        const diff = this.difficulty || 'easy';
        
        const roomDisplay = document.getElementById('room-id');
        if (roomDisplay) {
            roomDisplay.innerText = this.room === 1 ? "ROOM 1" : "ROOM " + this.room + " - SECTION " + this.subRoom;
        }

        if (this.room === 1) {
            this.zombies.push(new Zombie(600, null, false, diff));
            this.zombies.push(new Zombie(1000, null, false, diff));
        } 
        else if (this.room === 2) {
            if (this.subRoom === 1) {
                this.zombies.push(new Zombie(800, null, false, diff));
            } else if (this.subRoom === 2) {
                this.platforms.push(new Platform(300, 690, 400));
                this.platforms.push(new Platform(800, 400, 400)); 
                this.zombies.push(new Zombie(350, this.platforms[0], false, diff));
            } else if (this.subRoom === 3) {
                this.platforms.push(new Platform(800, 690, 400)); 
                const pKey = new Platform(1100, 400, 600);
                this.platforms.push(pKey);
                
                if (this.collectedKeys < 1) {
                    this.keys.push({x: 1250, y: 370, col: false}); 
                }
                this.zombies.push(new Zombie(1200, pKey, false, diff));
            }
        } 
        else if (this.room === 3) {
            if (this.subRoom === 1) {
                const p1 = new Platform(500, 690, 500);
                this.platforms.push(p1);
                this.zombies.push(new Zombie(600, p1, false, diff));
            } else if (this.subRoom === 2) {
                this.platforms.push(new Platform(400, 690, 500)); 
                const pBoss = new Platform(1000, 400, 700); 
                this.platforms.push(pBoss);
                
                if (this.collectedKeys < 2) {
                    // BOSS SPAWN
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
                icon.classList.add('collected');
            } else {
                icon.classList.remove('collected');
            }
        });
    },

    performAttack() {
        this.player.atking = true; 
        setTimeout(() => { this.player.atking = false; }, 150);
        this.zombies.forEach(z => {
            if (z.alive && Math.abs(this.player.x - z.x) < 130 && Math.abs(this.player.y - z.y) < 180) {
                z.hp -= 40; 
                if (z.hp <= 0) z.alive = false;
            }
        });
    },

    interact() {
        // --- GOING FORWARD ---
        if (this.player.x > 1600) {
            if (this.room === 1) {
                this.room = 2; this.subRoom = 1; this.player.x = 400; this.setupRoom();
            } else if (this.room === 2) {
                if (this.subRoom < 3) {
                    this.subRoom++; this.player.x = 400; this.setupRoom();
                } else if (this.subRoom === 3) {
                    if (this.collectedKeys >= 1) {
                        this.room = 3; this.subRoom = 1; this.player.x = 400; this.setupRoom();
                    } else { alert("DOOR LOCKED! FIND THE KEY IN SECTION 3."); }
                }
            } else if (this.room === 3) {
                if (this.subRoom === 1) {
                    this.subRoom = 2; this.player.x = 400; this.setupRoom();
                } else if (this.subRoom === 2) {
                    if (this.collectedKeys >= 2) { this.loadPuzzle(); }
                    else { alert("THE FINAL DOOR REQUIRES THE BOSS KEY!"); }
                }
            }
        }
        // --- GOING BACKWARD ---
        else if (this.player.x < 350) {
            if (this.room === 3) {
                if (this.subRoom === 2) {
                    this.subRoom = 1; this.player.x = 1500; this.setupRoom();
                } else if (this.subRoom === 1) {
                    this.room = 2; this.subRoom = 3; this.player.x = 1500; this.setupRoom();
                }
            } else if (this.room === 2) {
                if (this.subRoom > 1) {
                    this.subRoom--; this.player.x = 1500; this.setupRoom();
                } else if (this.subRoom === 1) {
                    this.room = 1; this.player.x = 1500; this.setupRoom();
                }
            }
        }
    },

    async loadPuzzle() {
        this.puzzleActive = true;
        try {
            const r = await fetch('https://marcconrad.com/uob/banana/api.php');
            const d = await r.json();
            this.puzzleAnswer = d.solution;
            document.getElementById('puzzle-img').src = d.question;
            this.toggleLayer('puzzle-layer');
        } catch(e) {
            this.puzzleAnswer = 5; 
            this.toggleLayer('puzzle-layer');
        }
    },

    checkPuzzle() {
        const input = document.getElementById('puzzle-input');
        if (parseInt(input.value) === this.puzzleAnswer) {
            this.toggleLayer('menu-win');
        } else {
            this.tries--;
            input.value = "";
            if (this.tries <= 0) this.toggleLayer('menu-death');
            else alert("WRONG! " + this.tries + " TRIES LEFT.");
        }
    },

    loop() {
        this.ctx.clearRect(0, 0, 1920, 1080);
        if (this.active) {
            if (!this.puzzleActive) this.player.update(this.inputs, this.platforms, 1080);
            
            this.zombies.forEach(z => {
                z.update(this.player.x, this.player.y);
                if (z.alive && Math.abs(this.player.x - z.x) < (z.isMega ? 120 : 70) && Math.abs(this.player.y - z.y) < 120) {
                    this.player.hp -= z.isMega ? 1.1 : 0.5;
                }
            });

            this.keys.forEach(k => {
                if (!k.col && Math.abs(this.player.x - k.x) < 100 && Math.abs(this.player.y - k.y) < 150) {
                    k.col = true; 
                    this.collectedKeys++; 
                    this.updateKeyUI();
                }
            });

            this.ctx.drawImage(this.images.bg, 0, 0, 1920, 1080);
            
            if ((this.room === 2 && this.subRoom === 1) || (this.room === 3 && this.subRoom === 1)) {
                this.ctx.drawImage(this.images.d, 50, 580, 220, 500);
            }
            if (this.room === 1 || (this.room === 2 && this.subRoom === 3) || (this.room === 3 && this.subRoom === 2)) {
                this.ctx.drawImage(this.images.d, 1700, 580, 220, 500);
            }

            this.platforms.forEach(p => {
                this.ctx.drawImage(this.images.plat, p.x, p.y, p.w, 60);
            });

            this.zombies.forEach(z => { z.draw(this.ctx, this.images.z); });
            this.player.draw(this.ctx, this.images.p);
            
            this.keys.forEach(k => { 
                if (!k.col) { 
                    this.ctx.font = "70px Arial"; 
                    this.ctx.fillText("🔑", k.x, k.y); 
                }
            });

            document.getElementById('hp-fill').style.width = this.player.hp + "%";
            document.getElementById('hp-text').innerText = Math.ceil(this.player.hp) + "%";
            
            const canGo = (this.player.x > 1600 || (this.player.x < 350 && this.room >= 2));
            document.getElementById('interact-prompt').classList.toggle('hidden', !canGo || this.puzzleActive);

            if (this.player.hp <= 0) {
                this.active = false;
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
            this.updateAuthUI(user);
            this.toggleLayer('menu-main');
        } else { alert("Enter both Username and PIN, bro!"); }
    },

    logout() {
        localStorage.removeItem('gameUser');
        this.updateAuthUI(null);
        location.reload(); 
    },

    updateAuthUI(username) {
        const welcomeArea = document.getElementById('user-welcome');
        const welcomeText = document.getElementById('welcome-text');
        const loginBtn = document.querySelector("button[onclick*='menu-login']");
        const gameUserTag = document.getElementById('game-username-tag'); 

        if (username) {
            welcomeText.innerText = "PLAYER: " + username.toUpperCase();
            welcomeArea.classList.remove('hidden');
            if (loginBtn) loginBtn.style.display = 'none';
            if (gameUserTag) gameUserTag.innerText = username.toUpperCase();
        } else {
            welcomeArea.classList.add('hidden');
            if (loginBtn) loginBtn.style.display = 'block';
        }
    },

    toggleLayer(id) {
        document.querySelectorAll('.ui-layer').forEach(l => l.classList.add('hidden'));
        const welcomeArea = document.getElementById('user-welcome');
        
        if (id === 'none') {
            welcomeArea.classList.add('hidden'); 
        } else if (localStorage.getItem('gameUser')) {
            welcomeArea.classList.remove('hidden');
        }

        if (id !== 'none') {
            const el = document.getElementById(id);
            if (el) el.classList.remove('hidden');
        }
    }
};

game.init();