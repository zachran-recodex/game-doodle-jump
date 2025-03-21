import GAME_CONFIG from './config.js';

class Platform {
    constructor(canvas, position = null, image = null) {
        this.canvas = canvas;
        this.width = GAME_CONFIG.PLATFORM_WIDTH;
        this.height = GAME_CONFIG.PLATFORM_HEIGHT;
        this.image = image;
        this.isFloor = false;
        
        if (position) {
            this.x = position.x;
            this.y = position.y;
            if (position.width) {
                this.width = position.width;
            }
            if (position.isFloor !== undefined) {
                this.isFloor = position.isFloor;
            }
        } else {
            this.reset();
        }
    }

    reset() {
        this.x = Math.random() * (this.canvas.width - this.width);
        this.y = Math.random() * this.canvas.height;
        this.isFloor = false;
    }
    
    recycle(canvasHeight, canvasWidth) {
        // Place the platform at the top but off-screen
        this.y = -this.height - Math.random() * 50;
        
        // Randomize x position
        this.x = Math.random() * (canvasWidth - this.width);
        
        // Make sure platform is never a floor
        this.isFloor = false;
        
        // Occasionally create a moving platform
        this.isMoving = Math.random() > 0.7;
        this.moveSpeed = (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1);
        this.moveRange = {
            min: Math.max(0, this.x - 100),
            max: Math.min(canvasWidth - this.width, this.x + 100)
        };
        
        return true; // Platform recycled
    }

    update() {
        // Handle moving platforms
        if (this.isMoving) {
            this.x += this.moveSpeed;
            
            // Reverse direction at boundaries
            if (this.x <= this.moveRange.min || this.x >= this.moveRange.max) {
                this.moveSpeed *= -1;
            }
        }
        
        if (this.y > this.canvas.height) {
            return this.recycle(this.canvas.height, this.canvas.width);
        }
        return false;
    }

    draw(ctx) {
        // Draw shadow under platform
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(this.x + 5, this.y + 5, this.width, this.height);
        
        // Draw platform with image
        if (this.image) {
            // Draw standard platforms from image
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            
            // Add visual indicator for moving platforms
            if (this.isMoving) {
                ctx.fillStyle = 'rgba(255,255,0,0.3)';
                ctx.fillRect(this.x, this.y, this.width, 3);
            }
        } else {
            // Fallback if image fails to load
            if (this.isFloor) {
                ctx.fillStyle = '#8B4513';
            } else if (this.isMoving) {
                ctx.fillStyle = '#FFCC00';
            } else {
                ctx.fillStyle = '#00AA00';
            }
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

export default Platform;