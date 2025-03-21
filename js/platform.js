import GAME_CONFIG from './config.js';

class Platform {
    constructor(canvas, position = null, image = null) {
        this.canvas = canvas;
        this.width = GAME_CONFIG.PLATFORM_WIDTH;
        this.height = GAME_CONFIG.PLATFORM_HEIGHT;
        this.image = image;
        
        if (position) {
            this.x = position.x;
            this.y = position.y;
            if (position.width) {
                this.width = position.width;
            }
        } else {
            this.reset();
        }
    }

    reset() {
        this.x = Math.random() * (this.canvas.width - this.width);
        this.y = Math.random() * this.canvas.height;
    }

    update() {
        if (this.y > this.canvas.height) {
            this.y = 0;
            this.x = Math.random() * (this.canvas.width - this.width);
            return true; // Platform recycled
        }
        return false;
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

export default Platform;