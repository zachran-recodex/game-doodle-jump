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
        this.gameState = 'loading'; // Add game state tracking
        
        // Load images before starting the game
        this.loadImages().then(() => {
            console.log('Images loaded successfully:', this.images);
            this.player = new Player(this.canvas, this.images.player);
            this.platforms = [];
            this.score = 0;
            this.highestY = 0; // Track highest position for better scoring
            this.gameState = 'ready';
    
            this.initEventListeners();
            // Enable start button after images are loaded
            this.startButton.disabled = false;
            
            // Mulai lazy loading resource tambahan
            this.lazyLoadAssets();
        }).catch(error => {
            console.error('Failed to load game images:', error);
            this.gameState = 'error';
            alert('Failed to load game resources. Please check that all image files exist in the assets folder and refresh the page.');
        });
    }
    
    async loadImages() {
        try {
            // Ganti dengan preloadCriticalAssets untuk fokus pada asset penting
            this.images = {};
            await this.preloadCriticalAssets().then(images => {
                // Memetakan hasil ke dalam this.images
                this.images.player = images[0];
                this.images.platform = images[1];
            });
            
            // Verify images loaded correctly
            if (!this.images.player || !this.images.platform) {
                throw new Error('Images not loaded properly');
            }
            
            return this.images;
        } catch (error) {
            console.error('Image loading error:', error);
            throw new Error('Failed to load game assets');
        }
    }

    async loadImages() {
        try {
            const imagePaths = {
                player: './assets/player.png',
                platform: './assets/platform.png'
            };
            
            console.log('Attempting to load images from:', imagePaths);
    
            this.images = {};
            const loadPromises = Object.entries(imagePaths).map(([key, path]) => 
                this.loadImage(path).then(img => this.images[key] = img)
            );
            
            await Promise.all(loadPromises);
            
            // Verify images loaded correctly
            if (!this.images.player || !this.images.platform) {
                throw new Error('Images not loaded properly');
            }
            
            return this.images;
        } catch (error) {
            console.error('Image loading error:', error);
            throw new Error('Failed to load game assets');
        }
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const timeoutId = setTimeout(() => {
                img.src = ''; // Cancel image request
                reject(new Error(`Image load timeout (5s): ${src}`));
            }, 5000);
            
            img.onload = () => {
                clearTimeout(timeoutId);
                resolve(img);
            };
            
            img.onerror = () => {
                clearTimeout(timeoutId); // Juga perlu membersihkan timeout saat error
                console.error(`Failed to load image: ${src}`);
                reject(new Error(`Image not found: ${src}`));
            };
            
            img.src = src;
        });
    }
    
    // Tambahkan metode baru ini
    preloadCriticalAssets() {
        // Preload semua asset yang dibutuhkan untuk gameplay awal
        return Promise.all([
            this.loadImage('./assets/player.png'),
            this.loadImage('./assets/platform.png')
        ]);
    }
    
    // Tambahkan metode baru ini
    lazyLoadAssets() {
        // Load asset tambahan saat game sudah berjalan
        setTimeout(() => {
            const audioAssets = [
                './assets/jump.mp3',
                './assets/land.mp3',
                './assets/game_over.mp3'
            ];
            
            audioAssets.forEach(src => {
                const audio = new Audio();
                audio.src = src;
            });
        }, 1000);
    }

    initEventListeners() {
        // Improve keyboard handling
        window.addEventListener('keydown', e => {
            // Prevent scrolling with spacebar and arrow keys
            if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', e => this.keys[e.key] = false);
        this.startButton.addEventListener('click', () => this.startGame());
        
        // Add touch controls for mobile
        this.canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const touch = e.touches[0];
            const canvasRect = this.canvas.getBoundingClientRect();
            if (touch.clientX < canvasRect.width / 2) {
                this.keys['ArrowLeft'] = true;
                this.keys['ArrowRight'] = false;
            } else {
                this.keys['ArrowLeft'] = false;
                this.keys['ArrowRight'] = true;
            }
            this.keys[' '] = true; // Enable jumping on touch
        });
        
        this.canvas.addEventListener('touchend', e => {
            e.preventDefault();
            this.keys['ArrowLeft'] = false;
            this.keys['ArrowRight'] = false;
            this.keys[' '] = false;
        });
        
        // Add resize handler to adjust game when window resizes
        window.addEventListener('resize', () => {
            if (this.gameState === 'playing' || this.gameState === 'ready') {
                this.adjustCanvasSize();
            }
        });
    }
    
    adjustCanvasSize() {
        // Maintain aspect ratio but scale to fit window
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const scale = Math.min(1, containerWidth / GAME_CONFIG.CANVAS_WIDTH);
        
        // Apply scale using CSS transform
        this.canvas.style.transform = `scale(${scale})`;
        this.canvas.style.transformOrigin = 'center top';
    }

    initGame() {
        this.keys = {};
        this.platforms = [];
        this.highestY = 0;
        
        // Add initial floor platform that spans the entire width
        this.platforms.push(new Platform(this.canvas, {
            x: 0,
            y: GAME_CONFIG.FLOOR_Y,
            width: this.canvas.width,
            isFloor: true
        }, this.images.platform));
    
        // Distribute platforms evenly at first to ensure playability
        const sectionHeight = GAME_CONFIG.FLOOR_Y / GAME_CONFIG.PLATFORM_COUNT;
        for (let i = 1; i < GAME_CONFIG.PLATFORM_COUNT; i++) {
            const yPosition = GAME_CONFIG.FLOOR_Y - (i * sectionHeight);
            const platform = new Platform(this.canvas, {
                x: Math.random() * (this.canvas.width - GAME_CONFIG.PLATFORM_WIDTH),
                y: yPosition,
                width: GAME_CONFIG.PLATFORM_WIDTH,
                isFloor: false
            }, this.images.platform);
            
            this.platforms.push(platform);
        }
        
        // Reset player at floor level
        this.player.reset();
        this.player.y = GAME_CONFIG.FLOOR_Y - this.player.height;
        this.player.velocityY = 0;
        
        this.score = 0;
        this.updateScore(0);
    }

    updateScore(points) {
        this.score += points;
        this.scoreElement.textContent = this.score;
    }

    startGame() {
        if (this.gameState === 'playing') {
            return; // Prevent multiple game instances
        }
        
        this.gameState = 'playing';
        this.startButton.style.display = 'none';
        this.initGame();
        this.lastTime = performance.now();
        this.gameLoop();
        
        // Pastikan asset tambahan sudah dimuat
        this.lazyLoadAssets();
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.player.update(this.keys, deltaTime);

        // Track highest position for better scoring
        if (this.player.y < this.highestY) {
            this.highestY = this.player.y;
            this.updateScore(1); // Award points for height
        }

        // Platform collision - improved
        let isOnPlatform = false;
        this.platforms.forEach(platform => {
            if (this.player.velocityY > 0 && // Only check when falling
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > platform.y &&
                this.player.y + this.player.height < platform.y + platform.height * 1.2) // Slight forgiveness
            {
                this.player.land(platform.y);
                isOnPlatform = true;
                
                // Jump if space is pressed
                if (this.keys[' ']) {
                    this.player.jump();
                    this.updateScore(10);
                    
                    // Remove floor platform when player jumps from any platform
                    if (this.platforms[0]?.isFloor) {
                        this.platforms.shift();
                    }
                }
            }
        });

        // Tambahkan penanganan ketika pemain tidak pada platform
        if (!isOnPlatform && !this.player.isJumping && this.player.velocityY >= 0) {
            this.player.isJumping = true;
        }

        // Camera/screen scroll based on player height
        if (this.player.y < this.canvas.height / 2) {
            const scrollAmount = this.canvas.height / 2 - this.player.y;
            this.player.y += scrollAmount;
            
            // Move platforms down
            this.platforms.forEach(platform => {
                platform.y += scrollAmount;
                
                // Recycle platforms that fall off screen
                if (platform.y > this.canvas.height) {
                    platform.recycle(this.canvas.height, this.canvas.width);
                    this.updateScore(20);
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
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, "#87CEEB");
        gradient.addColorStop(1, "#4682B4");
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw platforms
        this.platforms.forEach(platform => platform.draw(this.ctx));
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw score at top
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width - 10, 30);
    }

    async gameOver() {
        if (this.gameState !== 'playing') {
            return; // Prevent multiple game over calls
        }
        
        this.gameState = 'gameOver';
        
        // Cancel any pending animation frames
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Show game over message
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`Your Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        
        // Get player name after a short delay to prevent accidental clicks
        setTimeout(async () => {
            const playerName = prompt('Game Over! Enter your name:');
            if (playerName && playerName.trim()) {
                await this.saveScore(playerName.trim(), this.score);
            }
            this.startButton.style.display = 'block';
            this.gameState = 'ready';
        }, 1000);
    }

    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;
        
        if (!this.lastTime) this.lastTime = currentTime;
        let deltaTime = (currentTime - this.lastTime) / 1000; // convert to seconds
        
        // Cap delta time untuk menghindari physics jump pada lag
        deltaTime = Math.min(deltaTime, 0.1);
        
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    async saveScore(playerName, score) {
        try {
            const formData = new FormData();
            formData.append('player_name', playerName);
            formData.append('score', score);
            
            const response = await fetch('save_score.php', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                // Update high scores without full page reload
                const highScoresElement = document.getElementById('highScores');
                if (highScoresElement) {
                    const highScoresHtml = await fetch('get_high_scores.php').then(res => res.text());
                    if (highScoresHtml) {
                        highScoresElement.innerHTML = highScoresHtml;
                    } else {
                        location.reload(); // Fallback to page reload
                    }
                } else {
                    location.reload();
                }
            } else {
                console.error('Error response from server:', await response.text());
            }
        } catch (error) {
            console.error('Error saving score:', error);
            alert('Failed to save your score. Please try again.');
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});