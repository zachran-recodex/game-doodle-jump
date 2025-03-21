<?php
include 'config/db_config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $player_name = filter_input(INPUT_POST, 'player_name', FILTER_SANITIZE_STRING);
    $score = filter_input(INPUT_POST, 'score', FILTER_SANITIZE_NUMBER_INT);

    if ($player_name && $score) {
        $stmt = $pdo->prepare("INSERT INTO scores (player_name, score) VALUES (?, ?)");
        $stmt->execute([$player_name, $score]);
        echo "Score saved successfully";
    }
}
?>