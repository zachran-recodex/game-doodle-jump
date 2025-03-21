import GAME_CONFIG from './config.js';

class Player {
    constructor(canvas, image) {
        this.canvas = canvas;
        this.width = 50;  // Adjust size as needed
        this.height = 50; // Adjust size as needed
        this.x = canvas.width / 2;
        this.y = GAME_CONFIG.FLOOR_Y - this.height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.image = image;
        this.facingRight = true;
    }

    reset() {
        this.x = this.canvas.width / 2;
        this.y = GAME_CONFIG.FLOOR_Y - this.height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.facingRight = true;
    }

    draw(ctx) {
        // Draw player image with correct facing direction
        ctx.save();
        if (!this.facingRight) {
            ctx.scale(-1, 1);
            ctx.drawImage(this.image, -this.x - this.width, this.y, this.width, this.height);
        } else {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }

    update(keys) {
        // Update facing direction based on movement
        if (keys['ArrowLeft']) {
            this.facingRight = false;
            const newX = this.x - GAME_CONFIG.PLAYER_SPEED;
            this.x = Math.max(-this.width, newX); // Prevent going too far left
        } else if (keys['ArrowRight']) {
            this.facingRight = true;
            const newX = this.x + GAME_CONFIG.PLAYER_SPEED;
            this.x = Math.min(this.canvas.width, newX); // Prevent going too far right
        }
        
        this.velocityY += GAME_CONFIG.GRAVITY;
        this.y += this.velocityY;
    
        // Screen wrapping with smoother transition
        if (this.x + this.width < 0) {
            this.x = this.canvas.width - 1;
        } else if (this.x > this.canvas.width) {
            this.x = -this.width + 1;
        }
    }
}

export default Player;