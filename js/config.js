// Game configuration
const GAME_CONFIG = {
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 600,
    PLATFORM_COUNT: 7,
    PLATFORM_WIDTH: 70,
    PLATFORM_HEIGHT: 20,
    GRAVITY: 0.5,
    JUMP_FORCE: -15,
    SCROLL_SPEED: 3,
    PLAYER_SPEED: 5,
    FLOOR_Y: 580,
    DIFFICULTY_INCREASE_RATE: 0.1,  // How quickly difficulty increases
    PLATFORM_TYPES: {
        NORMAL: 0,
        MOVING: 1,
        BREAKABLE: 2,
        BONUS: 3
    },
    SOUNDS: {
        JUMP: './assets/jump.mp3',
        LAND: './assets/land.mp3',
        GAME_OVER: './assets/game_over.mp3',
        BACKGROUND: './assets/background.mp3'
    }
};

export default GAME_CONFIG;