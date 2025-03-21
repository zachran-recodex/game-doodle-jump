import GAME_CONFIG from './config.js';

class Player {
    constructor(canvas, image) {
        this.canvas = canvas;
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = GAME_CONFIG.FLOOR_Y - this.height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.image = image;
        this.facingRight = true;
        this.isJumping = false;
        this.jumpSound = new Audio('./assets/jump.mp3'); // Add sound (create the file)
        this.jumpSound.volume = 0.3;
    }

    reset() {
        this.x = this.canvas.width / 2 - this.width / 2;
        this.y = GAME_CONFIG.FLOOR_Y - this.height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.facingRight = true;
        this.isJumping = false;
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

    jump() {
        if (!this.isJumping) {
            this.velocityY = GAME_CONFIG.JUMP_FORCE;
            this.isJumping = true;
            
            // Play jump sound with error handling
            try {
                this.jumpSound.currentTime = 0;
                this.jumpSound.play().catch(e => console.log('Audio play failed:', e));
            } catch (e) {
                console.log('Audio error:', e);
            }
        }
    }

    land(platformY) {
        // Only land if we're falling
        if (this.velocityY > 0) {
            this.velocityY = 0;
            this.y = platformY - this.height;
            this.isJumping = false;
        }
    }

    update(keys, deltaTime) {
        // Apply speed based on delta time for consistent movement
        const speed = GAME_CONFIG.PLAYER_SPEED * (deltaTime || 1/60);
        
        // Update facing direction based on movement
        if (keys['ArrowLeft']) {
            this.facingRight = false;
            this.velocityX = -speed * 5;
        } else if (keys['ArrowRight']) {
            this.facingRight = true;
            this.velocityX = speed * 5;
        } else {
            // Apply friction to slow down player when not pressing keys
            this.velocityX *= 0.8;
        }
        
        // Update position with smoothing
        this.x += this.velocityX;
        
        // Apply gravity based on delta time
        this.velocityY += GAME_CONFIG.GRAVITY * (deltaTime || 1/60) * 60;
        this.y += this.velocityY;
    
        // Screen wrapping with smoother transition
        if (this.x + this.width < 0) {
            this.x = this.canvas.width;
        } else if (this.x > this.canvas.width) {
            this.x = -this.width;
        }
        
        // Clamp velocities to prevent extreme values
        this.velocityY = Math.min(this.velocityY, 20);
        this.velocityX = Math.max(Math.min(this.velocityX, 10), -10);
    }
}

export default Player;