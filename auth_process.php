<?php 
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

include 'db.php';
session_start();
//Post data
$action = $_POST['action'] ?? '';
$email = $_POST['email'] ?? '';

//send pin
if ($action == 'send_pin') {
    $pin = rand(100000, 999999);
    

    $conn->query("INSERT INTO users (email, pin) VALUES ('$email', '$pin') 
                  ON DUPLICATE KEY UPDATE pin='$pin'");

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; 
        $mail->SMTPAuth   = true;
        $mail->Username   = '1thi2da3s@gmail.com'; 
        $mail->Password   = 'bdisoaouucpgctvy'; 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
// email code part
        $mail->setFrom('1thi2da3s@gmail.com', 'Blood Blade System');
        $mail->addAddress($email);
        $mail->isHTML(true);
        $mail->Subject = 'SECURITY CODE: ' . $pin;
        $mail->Body    = "
            <div style='background: #1a1a1a; color: #fff; padding: 20px; border: 2px solid #800; font-family: monospace;'>
                <h1>BLOOD BLADE: ZERO</h1>
                <h2>GMAIL VERIFICATION</h2>
                <p style='font-size: 24px;'>YOUR CODE: $pin</span></p>
                <p><i>Do not share this code other players.</i></p>
            </div>";

        $mail->send();
        echo "Verification code sent to your inbox!";
        
    } catch (Exception $e) {
        echo "System Error: Mail could not be sent. Error: {$mail->ErrorInfo}";
    }
}

//verify pin
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

//save score
if ($action == 'save_score') {
    $score = $_POST['score'] ?? 0;
    // Saves only if it's the first score (0) or a faster time (lower number)
    $conn->query("UPDATE users SET high_score = $score WHERE email = '$email' AND (high_score = 0 OR high_score > $score)");
    echo "Score updated!";
}
//log out
if ($action == 'logout') {
    session_destroy();
    echo "Logged out";
}
?>