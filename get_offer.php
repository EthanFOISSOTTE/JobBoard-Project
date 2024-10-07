<?php
require 'connect.php'; // Connexion à la Base de Données

if (isset($_GET['id'])) {
    $id = intval($_GET['id']); // Assurez-vous que l'ID est un entier

    // Préparer et exécuter la requête pour récupérer les détails de l'offre
    $sql = "SELECT title, description, location, salary FROM JobOffer WHERE job_offer_id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    $offer = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($offer) {
        echo json_encode(['success' => true, 'offer' => $offer]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Aucune offre trouvée.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID manquant.']);
}
?>
