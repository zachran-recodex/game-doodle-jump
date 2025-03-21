<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Doodle Jump Game</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-gray-900 flex items-center justify-center min-h-screen">
    <div class="container mx-auto px-4">
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-white mb-4">Doodle Jump</h1>
            <p class="text-gray-300 mb-4">Score: <span id="score">0</span></p>
        </div>
        
        <div class="flex justify-center">
            <canvas id="gameCanvas" class="border-4 border-gray-700 bg-gray-800" width="400" height="600"></canvas>
        </div>

        <div class="mt-8 text-center">
            <button id="startGame" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                Start Game
            </button>
        </div>

        <div class="mt-8">
            <h2 class="text-2xl font-bold text-white mb-4">High Scores</h2>
            <div id="highScores" class="bg-gray-800 p-4 rounded">
                <?php
                include 'config/db_config.php';
                $stmt = $pdo->query("SELECT player_name, score FROM scores ORDER BY score DESC LIMIT 5");
                while ($row = $stmt->fetch()) {
                    echo "<div class='text-white mb-2'>{$row['player_name']}: {$row['score']}</div>";
                }
                ?>
            </div>
        </div>
    </div>
    
    <!-- Update the script tag to use type="module" -->
    <script type="module" src="js/game.js"></script>
</body>
</html>