class Zombie {
    constructor(x, plat, isMega = false, diff) {
        this.isMega = isMega;
        this.scale = isMega ? 1.6 : 1.0;
        this.w = 150 * this.scale; 
        this.h = 230 * this.scale;
        this.x = x; 
        // Force Y to sit on the platform if it exists, otherwise the ground
        this.y = plat ? plat.y - this.h : 1080 - this.h;
        this.plat = plat; 
        this.dir = 1; 
        this.alive = true;
        this.hp = (diff === 'hard' ? 160 : 100) * (isMega ? 3.0 : 1);
        this.maxHp = this.hp;
        this.speed = (diff === 'hard' ? 5 : 3) * (isMega ? 0.8 : 1);
    }

    update(px, py) {
        if (!this.alive) return;

        if (this.isMega && this.plat) {
            // BOSS LOGIC: Chase player but stay on the platform bounds
            let targetX = px;
            // Don't let the boss walk off the edge of its high platform
            if (targetX < this.plat.x) targetX = this.plat.x;
            if (targetX > this.plat.x + this.plat.w - this.w) targetX = this.plat.x + this.plat.w - this.w;

            if (this.x > targetX + 5) {
                this.x -= this.speed;
                this.dir = -1;
            } else if (this.x < targetX - 5) {
                this.x += this.speed;
                this.dir = 1;
            }
        } else if (this.plat) {
            // NORMAL PLATFORM PATROL
            if (this.x <= this.plat.x) this.dir = 1;
            else if (this.x + this.w >= this.plat.x + this.plat.w) this.dir = -1;
            this.x += this.speed * this.dir;
        } else {
            // GROUND FOLLOW
            if (this.x > px + 30) {
                this.x -= this.speed;
                this.dir = -1;
            } else if (this.x < px - 30) {
                this.x += this.speed;
                this.dir = 1;
            }
        }
    }

    draw(ctx, img) {
        if (!this.alive) return;
        ctx.save();
        
        if(this.isMega) {
            ctx.filter = "brightness(50%) sepia(100%) hue-rotate(-50deg) saturate(200%)";
            ctx.shadowBlur = 30;
            ctx.shadowColor = "red";
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