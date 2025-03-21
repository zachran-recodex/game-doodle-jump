import GAME_CONFIG from './config.js';
import Player from './player.js';
import Platform from './platform.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        if (!this.scoreElement) {
            throw new Error('Score element not found');
        }
        
        this.startButton = document.getElementById('startGame');
        if (!this.startButton) {
            throw new Error('Start button not found');
        }
        
        // Disable start button until images are loaded
        this.startButton.disabled = true;
        
        // Load images before starting the game
        this.loadImages().then(() => {
            console.log('Images loaded successfully:', this.images);
            this.player = new Player(this.canvas, this.images.player);
            this.platforms = [];
            this.score = 0;
            this.isGameRunning = false;
            this.keys = {};
    
            this.initEventListeners();
            // Enable start button after images are loaded
            this.startButton.disabled = false;
        }).catch(error => {
            console.error('Failed to load game images:', error);
            console.log('Current directory:', window.location.href);
            alert('Failed to load game resources. Please check that all image files exist in the assets folder and refresh the page.');
            // Optionally, you could try to reload assets automatically
            setTimeout(() => {
                location.reload();
            }, 3000);
        });
    }

    async loadImages() {
        try {
            const imagePaths = {
                player: './assets/player.png',
                platform: './assets/platform.png'
            };
            
            console.log('Attempting to load images from:', imagePaths);
    
            this.images = {
                player: await this.loadImage(imagePaths.player),
                platform: await this.loadImage(imagePaths.platform)
            };
            
            // Verify images loaded correctly
            if (!this.images.player || !this.images.platform) {
                throw new Error('Images not loaded properly');
            }
            
        } catch (error) {
            console.error('Image loading error:', error);
            console.error('Current path:', window.location.href);
            throw new Error('Failed to load game assets');
        }
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                reject(new Error(`Image not found: ${src}`));
            };
            
            // Remove crossOrigin since we're loading local files
            img.src = src;
            
            // Increase timeout for slower connections
            setTimeout(() => {
                reject(new Error(`Image load timeout (5s): ${src}`));
            }, 5000);
        });
    }

    initEventListeners() {
        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup', e => this.keys[e.key] = false);
        this.startButton.addEventListener('click', () => this.startGame());
    }

    initGame() {
        this.platforms = [];
        
        // Add initial floor platform that spans the entire width
        this.platforms.push(new Platform(this.canvas, {
            x: 0,
            y: GAME_CONFIG.FLOOR_Y,
            width: this.canvas.width,
            isFloor: true
        }, this.images.platform));
    
        // Add remaining platforms higher up
        for (let i = 1; i < GAME_CONFIG.PLATFORM_COUNT; i++) {
            const platform = new Platform(this.canvas, null, this.images.platform);
            platform.y = Math.random() * (GAME_CONFIG.FLOOR_Y - 100);
            this.platforms.push(platform);
        }
        
        // Reset player at floor level
        this.player.reset();
        this.player.y = GAME_CONFIG.FLOOR_Y - this.player.height;
        this.player.velocityY = 0;
        
        this.score = 0;
        this.scoreElement.textContent = this.score;
    }

    startGame() {
        if (this.isGameRunning) {
            return; // Prevent multiple game instances
        }
        this.isGameRunning = true;
        this.startButton.style.display = 'none';
        this.initGame();
        this.gameLoop();
    }

    update() {
        this.player.update(this.keys);

        // Platform collision
        this.platforms.forEach((platform, index) => {
            if (this.player.velocityY > 0 &&
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > platform.y &&
                this.player.y + this.player.height < platform.y + platform.height
            ) {
                // Only jump if space is pressed
                if (this.keys[' ']) {
                    this.player.velocityY = GAME_CONFIG.JUMP_FORCE;
                    this.score += 10;
                    this.scoreElement.textContent = this.score;
                    
                    // Remove floor platform when player jumps from any platform
                    if (this.platforms[0]?.isFloor) {
                        this.platforms.shift();
                    }
                } else {
                    // Stop falling when hitting platform
                    this.player.velocityY = 0;
                    this.player.y = platform.y - this.player.height;
                }
            }
        });

        // Move platforms down (remove floor check since it will be gone)
        if (this.player.y < this.canvas.height / 2) {
            this.player.y += GAME_CONFIG.SCROLL_SPEED;
            this.platforms.forEach(platform => {
                platform.y += GAME_CONFIG.SCROLL_SPEED;
                if (platform.update()) {
                    this.score += 20;
                    this.scoreElement.textContent = this.score.toString();
                    // Replace all instances where score is displayed
                }
            });
        }

        // Game over condition
        if (this.player.y > this.canvas.height) {
            this.gameOver();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player.draw(this.ctx);
        this.platforms.forEach(platform => platform.draw(this.ctx));
    }

    async gameOver() {
        if (!this.isGameRunning) {
            return; // Prevent multiple game over calls
        }
        this.isGameRunning = false;
        
        // Cancel any pending animation frames
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        const playerName = prompt('Game Over! Enter your name:');
        if (playerName && playerName.trim()) {
            await this.saveScore(playerName.trim(), this.score);
        }
        this.startButton.style.display = 'block';
    }

    gameLoop() {
        if (this.isGameRunning) {
            this.update();
            this.draw();
            this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
        }
    }

    async saveScore(playerName, score) {
        try {
            const response = await fetch('save_score.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `player_name=${encodeURIComponent(playerName)}&score=${score}`
            });
            if (response.ok) {
                location.reload();
            }
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});