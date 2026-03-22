<?php
include 'db.php';
session_start();

$action = $_POST['action'] ?? '';
$email = $_POST['email'] ?? '';

if ($action == 'send_pin') {
    $pin = rand(100000, 999999);
    $check = $conn->query("SELECT * FROM users WHERE email='$email'");
    if ($check->num_rows > 0) {
        $conn->query("UPDATE users SET pin='$pin' WHERE email='$email'");
    } else {
        $conn->query("INSERT INTO users (email, pin, high_score) VALUES ('$email', '$pin', 0)");
    }
    echo "DEBUG: Your code is $pin. (Check XAMPP/mail folder for real email simulation)";
}

if ($action == 'verify_pin') {
    $pin = $_POST['pin'] ?? '';
    $res = $conn->query("SELECT * FROM users WHERE email='$email' AND pin='$pin'");
    if ($res->num_rows > 0) {
        $_SESSION['user_email'] = $email;
        echo "Success";
    } else {
        echo "Invalid PIN!";
    }
}

if ($action == 'save_score') {
    $score = $_POST['score'] ?? 0;
    // We only update if the new time is LOWER (faster) than the old one, or if old score is 0
    $conn->query("UPDATE users SET high_score = $score WHERE email = '$email' AND (high_score = 0 OR high_score > $score)");
    echo "Score updated!";
}
if ($action == 'logout') {
    session_destroy();
    echo "Logged out";
}
?>