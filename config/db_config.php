<?php
// Enhance error handling and add more robust configuration
$host = 'localhost';
$port = 8889;
$dbname = 'doodle_jump';
$username = 'root';
$password = 'root';

// Use environment variables or a separate config file in production
try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", 
        $username, 
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch(PDOException $e) {
    // Log error securely in production
    error_log("Database Connection Error: " . $e->getMessage());
    
    // Generic error message for users
    header('HTTP/1.1 500 Internal Server Error');
    die('Database connection failed. Please try again later.');
}
?>