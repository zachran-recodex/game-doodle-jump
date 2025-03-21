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
        this.jumpSound = null;
        try {
            this.jumpSound = new Audio('./assets/jump.mp3');
            this.jumpSound.volume = 0.3;
            // Pre-load untuk menghindari delay pada audio pertama
            this.jumpSound.load();
        } catch (e) {
            console.log('Audio not supported:', e);
        }
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
            if (this.jumpSound) {
                try {
                    // Gunakan cloneNode untuk menghindari masalah audio yang masih playing
                    const soundEffect = this.jumpSound.cloneNode();
                    soundEffect.volume = 0.3;
                    soundEffect.play().catch(e => console.log('Audio play failed:', e));
                } catch (e) {
                    console.log('Audio error:', e);
                }
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
        // Use direct movement instead of physics-based velocity for horizontal movement
        // This makes the controls feel more responsive
        
        const moveSpeed = GAME_CONFIG.PLAYER_SPEED * 2; // Increase base movement speed
        
        if (keys['ArrowLeft']) {
            this.facingRight = false;
            // Move directly instead of changing velocity
            this.x -= moveSpeed;
        } 
        
        if (keys['ArrowRight']) {
            this.facingRight = true;
            // Move directly instead of changing velocity
            this.x += moveSpeed;
        }
        
        // Apply gravity based on delta time
        this.velocityY += GAME_CONFIG.GRAVITY * (deltaTime || 1/60) * 60;
        this.y += this.velocityY;
    
        // Screen wrapping with smoother transition
        if (this.x + this.width < 0) {
            this.x = this.canvas.width;
        } else if (this.x > this.canvas.width) {
            this.x = -this.width;
        }
        
        // Clamp vertical velocity to prevent extreme values
        this.velocityY = Math.min(this.velocityY, 20);
    }
}

export default Player;