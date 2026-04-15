<?php session_start(); ?>
<!DOCTYPE html> 
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SYSTEM LOGIN</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="ui-layer title-screen">
        <h1 class="game-title">SYSTEM LOGIN</h1>
        
        <div class="menu-options">
            <div id="email-section">
                <input type="email" id="login-email" placeholder="ENTER EMAIL" style="width: 300px; padding: 10px; margin-bottom: 10px; background: #000; color: #fff; border: 1px solid #800;">
                <br>
                <button class="menu-btn" onclick="sendPin()">SEND CODE</button>
            </div>
            
            <div id="pin-section" class="hidden">
                <input type="text" id="login-pin-input" placeholder="6-DIGIT PIN" style="width: 300px; padding: 10px; margin-bottom: 10px; background: #000; color: #fff; border: 1px solid #800;">
                <br>
                <button class="menu-btn" onclick="verifyPin()">VERIFY & LOGIN</button>
            </div>
            
            <button class="menu-btn" onclick="location.href='index.php'" style="width: 200px; margin-top: 20px;">BACK</button>
        </div>
    </div>

    <script>
    function sendPin() {
    const email = document.getElementById('login-email').value;
    if(!email) return alert("Enter email first!");

    const btn = document.querySelector("#email-section button");
    btn.innerText = "TRANSMITTING..."; // Visual feedback for the player
    btn.disabled = true;

    fetch('auth_process.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=send_pin&email=${email}`
    })
    .then(res => res.text())
    .then(data => {
        alert(data); // "Verification code sent to your inbox!"
        document.getElementById('email-section').classList.add('hidden');
        document.getElementById('pin-section').classList.remove('hidden');
    })
    .catch(err => {
        alert("Connection failed.");
        btn.innerText = "SEND CODE";
        btn.disabled = false;
    });
}

    function verifyPin() {
        const email = document.getElementById('login-email').value;
        const pin = document.getElementById('login-pin-input').value;
        fetch('auth_process.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=verify_pin&email=${email}&pin=${pin}`
        })
        .then(res => res.text())
        .then(data => {
            if(data.trim() === "Success") {
                localStorage.setItem('gameUser', email);
                location.href = 'index.php';
            } else {
                alert(data);
            }
        });
    }
    </script>
</body>
</html>