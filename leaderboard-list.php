<?php 
session_start(); 
include 'db.php'; // Connect to your MySQL

// Fetch the top 10 scores from the database
// We order by high_score (assuming lower time is better, or change to DESC for high kills)
$result = $conn->query("SELECT email, high_score FROM users WHERE high_score > 0 ORDER BY high_score ASC LIMIT 10");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>BLOOD BLADE: ZERO - LEADERBOARD</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="pixel-bg">
    <div class="ui-layer">
        <h1 class="game-title">TOP SURVIVORS</h1>
        
        <div class="leaderboard-container" style="background: rgba(0,0,0,0.8); border: 3px solid gold; padding: 30px; min-width: 550px;">
            <ul id="full-leaderboard" style="list-style: none; font-size: 24px; color: #6f00ffbb; text-align: left;">
                <?php
                if ($result->num_rows > 0) {
                    $rank = 1;
                    while($row = $result->fetch_assoc()) {
                        // We hide part of the email for privacy (e.g., user***@gmail.com)
                        $display_name = explode('@', $row['email'])[0]; 
                        echo "<li>
                                <span><span style='color: gold;'>$rank.</span> " . htmlspecialchars($display_name) . "</span>
                                <span style='color: #fff;'>" . $row['high_score'] . "s</span>
                              </li>";
                        $rank++;
                    }
                } else {
                    echo "<li style='justify-content: center; color: #666;'>NO DATA RECORDED</li>";
                }
                ?>
            </ul>
        </div>

        <div class="leaderboard-btn-container">
            <button onclick="clearGlobalLeaderboard()" style="border-color: #ff0000; color: #ff0000; background: rgba(40, 0, 0, 0.5);">
                RESET GLOBAL SCORES
            </button>
            
            <button onclick="location.href='index.php'">
                BACK TO MENU
            </button>
        </div>
    </div>

    <script>
        // Updated to talk to PHP for clearing the database
        function clearGlobalLeaderboard() {
            if (confirm("WARNING: This will wipe the ENTIRE database leaderboard. Proceed?")) {
                fetch('auth_process.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `action=clear_leaderboard`
                })
                .then(res => res.text())
                .then(data => {
                    alert(data);
                    location.reload();
                });
            }
        }
    </script>
</body>
</html>