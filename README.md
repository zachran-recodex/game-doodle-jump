# Doodle Jump Game Documentation

## Overview

This is a web-based clone of the popular Doodle Jump game built with PHP, JavaScript, HTML, CSS, and MySQL. The game features a player character that jumps from platform to platform, with the goal of reaching as high as possible while scoring points.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Installation](#installation)
3. [Game Mechanics](#game-mechanics)
4. [Configuration Options](#configuration-options)
5. [Code Architecture](#code-architecture)
6. [Database Setup](#database-setup)
7. [Asset Requirements](#asset-requirements)
8. [Customization Guide](#customization-guide)
9. [Troubleshooting](#troubleshooting)

## Project Structure

The project consists of the following files:

```
├── assets/                  # Game assets directory
│   ├── player.png           # Player character sprite
│   ├── platform.png         # Platform sprite
│   ├── jump.mp3             # Jump sound effect
│   ├── land.mp3             # Landing sound effect
│   ├── game_over.mp3        # Game over sound effect
│   └── background.mp3       # Background music
├── config/                  # Configuration files
│   └── db_config.php        # Database connection settings
├── js/                      # JavaScript files
│   ├── game.js              # Main game logic
│   ├── player.js            # Player class
│   ├── platform.js          # Platform class
│   └── config.js            # Game configuration constants
├── index.php                # Main entry point and game UI
├── styles.css               # CSS styles
├── get_high_scores.php      # API endpoint for retrieving high scores
└── save_score.php           # API endpoint for saving scores
```

## Installation

1. **Prerequisites:**
   - Web server with PHP 7.0+
   - MySQL 5.7+ or MariaDB 10.2+
   - Modern web browser with JavaScript enabled

2. **Database Setup:**
   - Create a MySQL database named `doodle_jump`
   - Create a `scores` table with the following structure:
     ```sql
     CREATE TABLE scores (
         id INT AUTO_INCREMENT PRIMARY KEY,
         player_name VARCHAR(100) NOT NULL,
         score INT NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```

3. **Configuration:**
   - Update `config/db_config.php` with your database credentials:
     ```php
     $host = 'your_database_host';
     $port = your_database_port; // typically 3306
     $dbname = 'doodle_jump';
     $username = 'your_database_username';
     $password = 'your_database_password';
     ```

4. **Assets:**
   - Create an `assets` directory and add the required images and sounds:
     - `player.png` - Player character sprite
     - `platform.png` - Platform sprite
     - Optional audio files: `jump.mp3`, `land.mp3`, `game_over.mp3`, `background.mp3`

5. **Deployment:**
   - Upload all files to your web server
   - Ensure the web server has write permissions for the database operations

## Game Mechanics

### Core Gameplay

- **Movement:** Left and right arrow keys to move the character horizontally
- **Jumping:** Automatic when landing on platforms, press Space to jump from platforms
- **Scoring:**
  - Points for gaining height (+1 per unit)
  - Points for jumping from platforms (+10)
  - Points for platforms recycling (+20)
- **Game Over:** When the player falls below the bottom of the screen

### Features

- **Platform Types:**
  - Regular platforms (green)
  - Moving platforms (yellow highlight)
  - Floor platform (initial brown platform, disappears after first jump)
- **Screen Wrapping:** Player can move off one side of the screen and appear on the opposite side
- **Dynamic Difficulty:** Game becomes progressively challenging as the player ascends
- **High Score System:** Player names and scores are stored in a database

### Mobile Support

- **Touch Controls:** Touch left/right side of the screen to move in that direction
- **Responsive Design:** Game adapts to different screen sizes

## Configuration Options

The game's behavior can be customized through the `config.js` file:

```javascript
const GAME_CONFIG = {
    CANVAS_WIDTH: 400,           // Canvas width in pixels
    CANVAS_HEIGHT: 600,          // Canvas height in pixels
    PLATFORM_COUNT: 7,           // Initial number of platforms
    PLATFORM_WIDTH: 70,          // Width of platforms in pixels
    PLATFORM_HEIGHT: 20,         // Height of platforms in pixels
    GRAVITY: 0.5,                // Gravity force applied to player
    JUMP_FORCE: -15,             // Initial velocity when jumping
    SCROLL_SPEED: 3,             // Screen scrolling speed
    PLAYER_SPEED: 5,             // Player horizontal movement speed
    FLOOR_Y: 580,                // Y position of the floor
    DIFFICULTY_INCREASE_RATE: 0.1, // How quickly difficulty increases
    // Platform types and sound paths defined here
};
```

## Code Architecture

The game follows an object-oriented architecture with ES6 modules:

### Classes

1. **Game (game.js):**
   - Main game controller
   - Handles game loop, scoring, collision detection, and UI

2. **Player (player.js):**
   - Manages player movement, physics, and rendering
   - Implements jumping mechanics and collision detection

3. **Platform (platform.js):**
   - Manages platform creation, recycling, and rendering
   - Supports different platform types (regular, moving, floor)

### Key Design Patterns

- **Module Pattern:** ES6 modules for code organization
- **Class-based OOP:** For game entity management
- **Game Loop Pattern:** For update and render cycles
- **Asset Loading:** Promise-based async image loading
- **Event-driven Programming:** For input handling

## Database Setup

The game uses MySQL to store player scores:

1. **Table Structure:**

```sql
CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. **Database Operations:**
   - `save_score.php`: Inserts new score records
   - `get_high_scores.php`: Retrieves top 5 highest scores
   - Both use PDO for secure database operations

## Asset Requirements

### Images

- **player.png:** Player character sprite (recommended size: 50x50px)
- **platform.png:** Platform sprite (recommended size: 70x20px)

### Audio (Optional)

- **jump.mp3:** Played when the player jumps
- **land.mp3:** Played when the player lands on a platform
- **game_over.mp3:** Played when the game ends
- **background.mp3:** Background music during gameplay

## Customization Guide

### Changing Game Appearance

1. **CSS Styling:**
   - Modify `styles.css` to change the game's appearance

2. **Game Canvas:**
   - Update gradient colors in the `draw()` method of `game.js`
   - Change canvas dimensions in `GAME_CONFIG` (requires UI adjustments)

### Adding New Features

1. **New Platform Types:**
   - Extend the `Platform` class with new behaviors
   - Add new platform type constants in `GAME_CONFIG.PLATFORM_TYPES`

2. **Power-ups:**
   - Create a new `PowerUp` class
   - Implement collision detection in the `Game.update()` method

3. **Obstacles:**
   - Create a new `Obstacle` class
   - Add spawning logic and collision detection

## Troubleshooting

### Common Issues

1. **Database Connection Failed:**
   - Check database credentials in `db_config.php`
   - Verify that MySQL server is running
   - Ensure proper permissions for the database user

2. **Images Not Loading:**
   - Check that all image files exist in the `assets` directory
   - Verify file paths and permissions
   - Check browser console for 404 errors

3. **Game Performance Issues:**
   - Reduce `PLATFORM_COUNT` in `config.js`
   - Optimize rendering in `draw()` methods
   - Check for memory leaks (remove event listeners properly)

4. **Mobile Touch Controls Not Working:**
   - Ensure touch event handlers are properly registered
   - Verify that `e.preventDefault()` is called to prevent scrolling

### Debug Tools

- Check browser console (F12) for JavaScript errors
- Enable verbose logging by adding `console.log()` statements
- Test database connections separately using a PHP script
