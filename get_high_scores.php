<?php
include 'config/db_config.php';

try {
    $stmt = $pdo->query("SELECT player_name, score FROM scores ORDER BY score DESC LIMIT 5");
    echo '<div class="space-y-2">';
    while ($row = $stmt->fetch()) {
        echo '<div class="flex justify-between items-center text-white p-2 border-b border-gray-700">';
        echo '<span class="font-semibold">' . htmlspecialchars($row['player_name']) . '</span>';
        echo '<span class="text-yellow-400">' . number_format($row['score']) . '</span>';
        echo '</div>';
    }
    echo '</div>';
} catch(PDOException $e) {
    echo '<div class="text-red-500 p-2">Error loading high scores</div>';
}
?>