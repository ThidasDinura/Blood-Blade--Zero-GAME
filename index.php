<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>BLOOD BLADE: ZERO - MENU</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="menu-main" class="ui-layer title-screen">
        <h1 class="game-title">BLOOD BLADE: ZERO</h1>
        <div class="menu-options">
            <button onclick="location.href='game.php'">NEW GAME</button>
            <button onclick="location.href='options.php'">OPTIONS</button>
            <button onclick="location.href='leaderboard-list.php'">LEADERBOARD</button>
            <button onclick="location.href='about.php'">ABOUT</button>
            
            <button id="nav-login" onclick="location.href='login.php'">LOGIN</button>
            <button id="nav-logout" class="hidden" onclick="game.logout()">LOGOUT</button>
        </div>
    </div>

    <div id="user-welcome" class="hidden">
        <span id="welcome-text"></span>
    </div>
</div>

    <script src="game.js"></script>
    <script>
    window.addEventListener('load', () => {
        // We check if PHP has a user session, otherwise fall back to local
        const phpUser = "<?php echo isset($_SESSION['user_email']) ? $_SESSION['user_email'] : ''; ?>";
        const savedUser = phpUser || localStorage.getItem('gameUser');
        
        if (window.game) {
            game.updateAuthUI(savedUser);
        }
    });
</script>
</body>
</html>
