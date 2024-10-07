<?php
// Informations de connexion
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "job_board";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    // Configurer PDO pour qu’il génère des exceptions en cas d’erreurs
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connexion réussie";
} catch(PDOException $e) {
    echo "La connexion a échoué : " . $e->getMessage();
}
?>
