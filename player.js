class Player {
    constructor() {
        this.x = 100; this.y = 800; this.vY = 0;
        this.hp = 100; this.dir = 1; this.atking = false;
        this.w = 110; this.h = 310;
        
        // Animation Helpers
        this.frameIndex = 0; 
        this.animTimer = 0;
        this.state = 'idle';
        this.landingTimer = 0; 
    }

    update(inputs, platforms, floorY, allSounds) { // Added allSounds here
        let moving = false;
        if (inputs.d) { this.x += 10; this.dir = 1; moving = true; }
        if (inputs.a) { this.x -= 10; this.dir = -1; moving = true; }

        this.vY += 1.6; this.y += this.vY;
        let onG = false;

        // Ground Check
        if (this.y + this.h >= floorY) { 
            if (this.vY > 20 && allSounds.land) allSounds.land.cloneNode().play(); // LAND SOUND
            if (this.vY > 5) this.landingTimer = 10; 
            this.y = floorY - this.h; 
            this.vY = 0; 
            onG = true; 
        }
        
        // Platform Check
        platforms.forEach(p => {
            if (this.vY > 0 && this.x + 80 > p.x && this.x + 20 < p.x + p.w && this.y + this.h >= p.y && this.y + this.h <= p.y + 45 + this.vY) {
                if (this.vY > 20 && allSounds.land) allSounds.land.cloneNode().play(); // LAND SOUND
                if (this.vY > 5) this.landingTimer = 10; 
                this.y = p.y - this.h; 
                this.vY = 0; 
                onG = true;
            }
        });

        // Jump Logic
        if (inputs.space && onG) {
            this.vY = -35;
            this.landingTimer = 0; 
    
        }
        this.x = Math.max(0, Math.min(this.x, 1810));

        // Animation States
        if (this.atking) {
            this.state = 'sword';
            this.animTimer++;
            if (this.animTimer % 13 === 0) this.frameIndex = (this.frameIndex + 1) % 3;
        } 
        else if (!onG) {
            this.state = 'jumping';
            this.frameIndex = (this.vY < -15) ? 0 : 1; 
        } 
        else if (this.landingTimer > 0) {
            this.state = 'jumping';
            this.frameIndex = 2; 
            this.landingTimer--;
        } 
        else if (moving) {
            this.state = 'walk';
            this.animTimer++;
            if (this.animTimer % 13 === 0) this.frameIndex = (this.frameIndex + 1) % 3;
        } 
        else {
            this.state = 'idle';
            this.frameIndex = 0;
        }
    }

    draw(ctx, allImages) {
        let currentImg = allImages.p; 
        if (this.state === 'sword') currentImg = allImages[`sword${this.frameIndex + 1}`];
        else if (this.state === 'jumping') currentImg = allImages[`jumping${this.frameIndex + 1}`];
        else if (this.state === 'walk') currentImg = allImages[`walk${this.frameIndex + 1}`];

        ctx.save();
        ctx.translate(this.x + 55, this.y + 155);
        if (this.dir === -1) ctx.scale(-1, 1);
        
        if (currentImg && currentImg.complete) {
            ctx.drawImage(currentImg, -90, -155, 180, 310);
        } else {
            ctx.drawImage(allImages.p, -90, -155, 180, 310);
        }
        ctx.restore();
    }
}