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
        this.acceleration = 0.05; // Reduced acceleration
        this.maxSpeed = 1; // Very low max speed
        this.friction = 0.85; // Slightly increased friction to slow down faster
        this.jumpSound = null;
        try {
            this.jumpSound = new Audio('./assets/jump.mp3');
            this.jumpSound.volume = 0.3;
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
            
            if (this.jumpSound) {
                try {
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
        if (this.velocityY > 0) {
            this.velocityY = 0;
            this.y = platformY - this.height;
            this.isJumping = false;
        }
    }

    update(keys, deltaTime) {
        // Gradual, more controlled horizontal movement
        if (keys['ArrowLeft']) {
            this.facingRight = false;
            this.velocityX -= this.acceleration;
            // Clamp to max speed
            this.velocityX = Math.max(-this.maxSpeed, this.velocityX);
        } else if (keys['ArrowRight']) {
            this.facingRight = true;
            this.velocityX += this.acceleration;
            // Clamp to max speed
            this.velocityX = Math.min(this.maxSpeed, this.velocityX);
        } else {
            // Apply friction when no movement keys are pressed
            this.velocityX *= this.friction;
            
            // Stop completely if velocity is very small
            if (Math.abs(this.velocityX) < 0.01) {
                this.velocityX = 0;
            }
        }

        // Update horizontal position
        this.x += this.velocityX;
    
        // Screen wrapping with smoother transition
        if (this.x + this.width < 0) {
            this.x = this.canvas.width;
        } else if (this.x > this.canvas.width) {
            this.x = -this.width;
        }
        
        // Apply gravity based on delta time
        this.velocityY += GAME_CONFIG.GRAVITY * (deltaTime || 1/60) * 60;
        this.y += this.velocityY;
        
        // Clamp vertical velocity to prevent extreme values
        this.velocityY = Math.min(this.velocityY, 20);
    }
}

export default Player;