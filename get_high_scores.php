<?php
include 'config/db_config.php';

try {
    $stmt = $pdo->query("SELECT player_name, score FROM scores ORDER BY score DESC LIMIT 5");
    while ($row = $stmt->fetch()) {
        echo "<div class='text-white mb-2'>{$row['player_name']}: {$row['score']}</div>";
    }
} catch(PDOException $e) {
    echo "<div class='text-red-500'>Error loading high scores</div>";
}
?>