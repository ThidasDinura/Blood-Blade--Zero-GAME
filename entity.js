class Platform {
    constructor(x, y, w) {
        this.x = x; this.y = y; this.w = w; this.h = 45;
    }
    draw(ctx) {
        ctx.fillStyle = "#333";
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = "#777";
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    }
}