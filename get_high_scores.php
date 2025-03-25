<?php
include 'config/db_config.php';

header('Content-Type: text/html; charset=utf-8');

try {
    $stmt = $pdo->query("SELECT player_name, score FROM scores ORDER BY score DESC LIMIT 10");
    $highScores = $stmt->fetchAll();

    if (empty($highScores)) {
        echo "<div class='text-white mb-2'>No high scores yet</div>";
    } else {
        foreach ($highScores as $index => $row) {
            $rank = $index + 1;
            $encodedName = htmlspecialchars($row['player_name'], ENT_QUOTES, 'UTF-8');
            echo "<div class='text-white mb-2'>$rank. {$encodedName}: {$row['score']}</div>";
        }
    }
} catch(PDOException $e) {
    error_log("High Scores Error: " . $e->getMessage());
    echo "<div class='text-red-500'>Error loading high scores</div>";
}
?>