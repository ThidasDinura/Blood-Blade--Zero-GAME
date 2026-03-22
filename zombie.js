class Zombie {
    constructor(x, plat, isMega = false, diff) {
        this.isMega = isMega;
        this.scale = isMega ? 1.6 : 1.0;
        this.w = 150 * this.scale; 
        this.h = 230 * this.scale;
        this.x = x; 
        this.y = plat ? plat.y - this.h : 1080 - this.h;
        this.plat = plat; 
        this.dir = 1; 
        this.alive = true;
        this.hp = (diff === 'hard' ? 160 : 100) * (isMega ? 2.0 : 1);
        this.maxHp = this.hp;
        this.speed = (diff === 'hard' ? 5 : 3) * (isMega ? 0.8 : 1);

        // Animation Helpers
        this.frame = 1;
        this.animTimer = 0;
        this.atking = false; 
    }

    update(px, py, allSounds) { 
        if (!this.alive) return; 
        let isMoving = false;

        // 1. ZOMBIE TALK (Only if alive)
        if (this.alive && Math.random() < 0.005 && allSounds.zTalk) {
            allSounds.zTalk.cloneNode().play();
        }

        // 2. MOVEMENT LOGIC (Restored your Original Logic)
        if (this.isMega && this.plat) {
            let targetX = px;
            if (targetX < this.plat.x) targetX = this.plat.x;
            if (targetX > this.plat.x + this.plat.w - this.w) targetX = this.plat.x + this.plat.w - this.w;

            if (this.x > targetX + 5) { this.x -= this.speed; this.dir = -1; isMoving = true; } 
            else if (this.x < targetX - 5) { this.x += this.speed; this.dir = 1; isMoving = true; }
        } 
        else if (this.plat) {
            // NORMAL PLATFORM PATROL (Prevents walking in air)
            if (this.x <= this.plat.x) this.dir = 1;
            else if (this.x + this.w >= this.plat.x + this.plat.w) this.dir = -1;
            this.x += this.speed * this.dir;
            isMoving = true;
        } 
        else {
            // GROUND FOLLOW
            if (this.x > px + 30) { this.x -= this.speed; this.dir = -1; isMoving = true; } 
            else if (this.x < px - 30) { this.x += this.speed; this.dir = 1; isMoving = true; }
        }

        // 3. ATTACK STATE CHECK
        let dist = Math.abs(this.x - px);
        if (dist < 60 && Math.abs(this.y - py) < 100) {
            this.atking = true;
        } else {
            this.atking = false;
        }

        // 4. ANIMATION CYCLING
        this.animTimer++;
        if (this.atking) {
            if (this.animTimer % 12 === 0) this.frame = (this.frame % 3) + 1;
        } else if (isMoving) {
            if (this.animTimer % 15 === 0) this.frame = (this.frame % 2) + 1;
        } else {
            this.frame = 1;
        }
    }

    draw(ctx, allImages) {
        if (!this.alive) return;
        let imgKey = this.atking ? `zattack${this.frame}` : `zwalk${this.frame}`;
        let img = allImages[imgKey] || allImages.z;

        ctx.save();
        if(this.isMega) {
            ctx.filter = "brightness(50%) sepia(100%) hue-rotate(-50deg) saturate(200%)";
            ctx.shadowBlur = 30; ctx.shadowColor = "red";
        }
        
        if (this.dir === 1) {
            ctx.drawImage(img, this.x, this.y, this.w, this.h);
        } else {
            ctx.scale(-1, 1);
            ctx.drawImage(img, -this.x - this.w, this.y, this.w, this.h);
        }
        ctx.restore();

        // HP Bar
        ctx.fillStyle = "black"; 
        ctx.fillRect(this.x, this.y - 30, this.w, 15);
        ctx.fillStyle = this.isMega ? "#840000" : "#ff0000"; 
        ctx.fillRect(this.x, this.y - 30, this.w * (this.hp / this.maxHp), 15);
    }
}