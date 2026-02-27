class Player {
    constructor() {
        this.x = 100; this.y = 800; this.vY = 0;
        this.hp = 100; this.dir = 1; this.atking = false;
        this.w = 110; this.h = 310;
    }
    update(inputs, platforms, floorY) {
        if (inputs.d) { this.x += 10; this.dir = 1; }
        if (inputs.a) { this.x -= 10; this.dir = -1; }
        this.vY += 1.6; this.y += this.vY;
        let onG = false;
        if (this.y + this.h >= floorY) { this.y = floorY - this.h; this.vY = 0; onG = true; }
        platforms.forEach(p => {
            if (this.vY > 0 && this.x + 80 > p.x && this.x + 20 < p.x + p.w && this.y + this.h >= p.y && this.y + this.h <= p.y + 45 + this.vY) {
                this.y = p.y - this.h; this.vY = 0; onG = true;
            }
        });
        if (inputs.space && onG) this.vY = -35;
        this.x = Math.max(0, Math.min(this.x, 1810));
    }
    draw(ctx, img) {
        ctx.save();
        ctx.translate(this.x + 55, this.y + 90);
        if (this.dir === -1) ctx.scale(-1, 1);
        ctx.drawImage(img, -55, -90, 180, 320);
        ctx.restore();
        if (this.atking) {
    ctx.strokeStyle = "rgba(255, 0, 255, 0.8)"; // Changed to Purple/Magenta to match your theme
    ctx.lineWidth = 4; // Made it THINNER (was 10)
    ctx.beginPath();
    
    // Adjusted the X offset and Radius to bring it CLOSER to the player
    // The radius is now 90 (was 140)
    let swordX = this.x + (this.dir === 1 ? 80 : 30); 
    ctx.arc(swordX, this.y + 90, 90, -1.2, 1.2); 
    
    ctx.stroke();
    
    // Optional: Add a small inner glow to make it look sharp
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.stroke();
        }
    }
}