<?php
include 'config/db_config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $player_name = filter_input(INPUT_POST, 'player_name', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        $score = filter_input(INPUT_POST, 'score', FILTER_VALIDATE_INT);

        if (empty($player_name) || $score === false) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
            exit;
        }

        // Limit player name length
        $player_name = substr($player_name, 0, 100);

        $stmt = $pdo->prepare("INSERT INTO scores (player_name, score) VALUES (:name, :score)");
        $stmt->bindParam(':name', $player_name, PDO::PARAM_STR);
        $stmt->bindParam(':score', $score, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode(['success' => true, 'message' => 'Score saved successfully']);
    } catch (PDOException $e) {
        error_log("Score Save Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Database error occurred']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
?>