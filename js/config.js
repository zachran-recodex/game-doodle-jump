// Game configuration with improved type definitions and validation
const GAME_CONFIG = Object.freeze({
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 600,
    PLATFORM_COUNT: 7,
    PLATFORM_WIDTH: 70,
    PLATFORM_HEIGHT: 20,
    GRAVITY: 0.5,
    JUMP_FORCE: -15,
    SCROLL_SPEED: 3,
    PLAYER_SPEED: 2, // Reduced from 5 to 2
    FLOOR_Y: 580,
    DIFFICULTY_INCREASE_RATE: 0.1,
    PLATFORM_TYPES: Object.freeze({
        NORMAL: 0,
        MOVING: 1,
        BREAKABLE: 2,
        BONUS: 3
    }),
    SOUNDS: Object.freeze({
        JUMP: './assets/jump.mp3',
        LAND: './assets/land.mp3',
        GAME_OVER: './assets/game_over.mp3',
        BACKGROUND: './assets/background.mp3'
    }),
    // Add validation method
    validate() {
        const requiredProps = [
            'CANVAS_WIDTH', 'CANVAS_HEIGHT', 'PLATFORM_COUNT', 
            'GRAVITY', 'JUMP_FORCE'
        ];
        
        requiredProps.forEach(prop => {
            if (typeof this[prop] !== 'number') {
                throw new Error(`Invalid configuration: ${prop} must be a number`);
            }
        });
    }
});

// Validate config on import
GAME_CONFIG.validate();

export default GAME_CONFIG;