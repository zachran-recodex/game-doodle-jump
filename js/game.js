import GAME_CONFIG from './config.js';
import Player from './player.js';
import Platform from './platform.js';

class Game {
    constructor() {
        this.initializeDOM();
        this.initializeGameState();
        this.setupErrorHandling();
        this.loadAssetsAndInitialize();
    }

    // Initialize DOM elements
    initializeDOM() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.startButton = document.getElementById('startGame');

        if (!this.canvas || !this.ctx || !this.scoreElement || !this.startButton) {
            throw new Error('Missing required DOM elements');
        }
    }

    // Set up initial game state
    initializeGameState() {
        this.gameState = 'loading';
        this.keys = {};
        this.platforms = [];
        this.score = 0;
        this.highestY = 0;
        this.sounds = {};
    }

    // Set up global error handling
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Unhandled error:', event.error);
            this.gameState = 'error';
            alert('An unexpected error occurred. Please reload the page.');
        });
    }

    // Load assets and prepare game
    async loadAssetsAndInitialize() {
        try {
            // Disable start button during loading
            this.startButton.disabled = true;

            // Load images and sounds
            await Promise.all([
                this.loadImages(),
                this.initializeSounds()
            ]);

            // Set up game components
            this.player = new Player(this.canvas, this.images.player);
            this.setupEventListeners();

            // Enable start button
            this.startButton.disabled = false;
            this.gameState = 'ready';

        } catch (error) {
            console.error('Game initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    // Load game images
    async loadImages() {
        const imagePaths = {
            player: './assets/player.png',
            platform: './assets/platform.png'
        };

        this.images = {};
        const loadPromises = Object.entries(imagePaths).map(([key, path]) => 
            this.loadImage(path).then(img => this.images[key] = img)
        );
        
        await Promise.all(loadPromises);
        
        if (!this.images.player || !this.images.platform) {
            throw new Error('Failed to load game images');
        }
    }

    // Utility method to load a single image
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            const timeoutId = setTimeout(() => {
                reject(new Error(`Image load timeout: ${src}`));
            }, 5000);
            
            img.onload = () => {
                clearTimeout(timeoutId);
                resolve(img);
            };
            
            img.onerror = (error) => {
                clearTimeout(timeoutId);
                console.warn(`Failed to load image: ${src}`, error);
                
                // Create a placeholder image
                const fallbackImg = new Image();
                fallbackImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
                resolve(fallbackImg);
            };
            
            img.src = src;
        });
    }

    // Initialize game sounds
    async initializeSounds() {
        const soundPaths = GAME_CONFIG.SOUNDS;
        
        const loadSound = (path) => {
            return new Promise((resolve, reject) => {
                const audio = new Audio(path);
                audio.addEventListener('canplaythrough', () => resolve(audio));
                audio.addEventListener('error', reject);
            });
        };

        try {
            this.sounds = {
                jump: await loadSound(soundPaths.JUMP),
                land: await loadSound(soundPaths.LAND),
                gameOver: await loadSound(soundPaths.GAME_OVER),
                background: await loadSound(soundPaths.BACKGROUND)
            };

            // Configure sound settings
            this.sounds.background.volume = 0.2;
            this.sounds.background.loop = true;
            Object.values(this.sounds).forEach(sound => sound.preload = 'auto');
        } catch (error) {
            console.warn('Sound loading failed:', error);
        }
    }

    // Set up event listeners
    setupEventListeners() {
        // Keyboard controls
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));

        // Touch controls
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Start button
        this.startButton.addEventListener('click', this.startGame.bind(this));

        // Resize handling
        window.addEventListener('resize', this.adjustCanvasSize.bind(this));
    }

    // Keyboard event handlers
    handleKeyDown(e) {
        if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        this.keys[e.key] = true;
    }

    handleKeyUp(e) {
        this.keys[e.key] = false;
    }

    // Touch event handlers
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const canvasRect = this.canvas.getBoundingClientRect();
        
        this.keys['ArrowLeft'] = touch.clientX < canvasRect.width / 2;
        this.keys['ArrowRight'] = !this.keys['ArrowLeft'];
        this.keys[' '] = true;
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.keys['ArrowLeft'] = false;
        this.keys['ArrowRight'] = false;
        this.keys[' '] = false;
    }

    // Adjust canvas size responsively
    adjustCanvasSize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const scale = Math.min(1, containerWidth / GAME_CONFIG.CANVAS_WIDTH);
        
        this.canvas.style.transform = `scale(${scale})`;
        this.canvas.style.transformOrigin = 'center top';
    }

    // Initialize game state
    initGame() {
        this.platforms = [];
        this.highestY = 0;
        this.score = 0;
        this.updateScore(0);

        // Create initial floor platform
        this.platforms.push(new Platform(this.canvas, {
            x: 0,
            y: GAME_CONFIG.FLOOR_Y,
            width: this.canvas.width,
            isFloor: true
        }, this.images.platform));

        // Distribute platforms
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

        // Reset player
        this.player.reset();
    }

    // Start the game
    startGame() {
        if (this.gameState === 'playing') return;
        
        this.gameState = 'playing';
        this.startButton.style.display = 'none';
        this.initGame();
        
        // Start background music
        if (this.sounds.background) {
            this.sounds.background.play().catch(console.error);
        }
        
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    // Main game loop
    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    // Update game state
    update(deltaTime) {
        this.player.update(this.keys, deltaTime);

        // Track highest position and score
        if (this.player.y < this.highestY) {
            this.highestY = this.player.y;
            this.updateScore(1);
        }

        // Platform interactions
        let isOnPlatform = this.checkPlatformCollisions();

        // Camera scrolling
        this.scrollScreen(isOnPlatform);

        // Game over check
        if (this.player.y > this.canvas.height) {
            this.gameOver();
        }
    }

    // Check platform collisions
    checkPlatformCollisions() {
        let isOnPlatform = false;
        this.platforms.forEach(platform => {
            if (this.player.velocityY > 0 && 
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > platform.y &&
                this.player.y + this.player.height < platform.y + platform.height * 1.2) {
                
                this.player.land(platform.y);
                isOnPlatform = true;
                
                if (this.keys[' ']) {
                    this.player.jump();
                    this.updateScore(10);
                    
                    // Remove floor platform on first jump
                    if (this.platforms[0]?.isFloor) {
                        this.platforms.shift();
                    }
                }
            }
        });
        return isOnPlatform;
    }

    // Screen scrolling logic
    scrollScreen(isOnPlatform) {
        if (this.player.y < this.canvas.height / 2) {
            const scrollAmount = this.canvas.height / 2 - this.player.y;
            this.player.y += scrollAmount;
            
            this.platforms.forEach(platform => {
                platform.y += scrollAmount;
                
                if (platform.y > this.canvas.height) {
                    platform.recycle(this.canvas.height, this.canvas.width);
                    this.updateScore(20);
                }
            });
        }
    }

    // Draw game elements
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, "#87CEEB");
        gradient.addColorStop(1, "#4682B4");
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw platforms and player
        this.platforms.forEach(platform => platform.draw(this.ctx));
        this.player.draw(this.ctx);
        
        // Draw score
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width - 10, 30);
    }

    // Game over handling
    async gameOver() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'gameOver';
        
        // Stop and play game over sounds
        if (this.sounds.background) {
            this.sounds.background.pause();
            this.sounds.background.currentTime = 0;
        }
        
        if (this.sounds.gameOver) {
            await this.sounds.gameOver.play().catch(console.error);
        }
        
        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Game over screen
        this.drawGameOverScreen();
        
        // Prompt for name and save score
        setTimeout(async () => {
            const playerName = prompt('Game Over! Enter your name:');
            if (playerName && playerName.trim()) {
                await this.saveScore(playerName.trim(), this.score);
            }
            this.startButton.style.display = 'block';
            this.gameState = 'ready';
        }, 1000);
    }

    // Draw game over screen
    drawGameOverScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`Your Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
    }

    // Update score display
    updateScore(points) {
        this.score += points;
        this.scoreElement.textContent = this.score;
    }

    // Save score to server
    async saveScore(playerName, score) {
        try {
            const response = await fetch('save_score.php', {
                method: 'POST',
                body: new URLSearchParams({
                    player_name: playerName,
                    score: score
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to save score');
            }
            
            // Update high scores
            await this.updateHighScores();
        } catch (error) {
            console.error('Score save error:', error);
            alert('Failed to save your score. Please try again.');
        }
    }

    // Update high scores display
    async updateHighScores() {
        try {
            const highScoresElement = document.getElementById('highScores');
            if (highScoresElement) {
                const response = await fetch('get_high_scores.php');
                const highScoresHtml = await response.text();
                highScoresElement.innerHTML = highScoresHtml;
            }
        } catch (error) {
            console.error('High scores update failed:', error);
        }
    }

    // Handle initialization errors
    handleInitializationError(error) {
        console.error('Game initialization failed:', error);
        const errorContainer = document.createElement('div');
        errorContainer.className = 'text-red-500 text-center';
        errorContainer.textContent = 'Game could not be initialized. Please check console for details.';
        document.body.appendChild(errorContainer);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});

export default Game;