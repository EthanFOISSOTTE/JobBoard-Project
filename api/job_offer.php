<?php
header("Content-Type: application/json");
require 'connect.php';

// Définir le HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Récupérer les données
$data = json_decode(file_get_contents("php://input"), true);

// Récupérer toutes les offres d'emploi
function getJobOffers($conn) {
    $stmt = $conn->prepare("SELECT job_offer_id, title, description, location, salary FROM JobOffer");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

//Créer une nouvelle offre d'emploi
function createJobOffer($conn, $data) {
    $stmt = $conn->prepare("INSERT INTO JobOffer (title, description, location, salary) VALUES (?, ?, ?, ?)");
    return $stmt->execute([$data['title'], $data['description'], $data['location'], $data['salary']]);
}

// Récupérer une offre d'emploi par ID
function getJobOfferById($conn, $id) {
    $stmt = $conn->prepare("SELECT job_offer_id, title, description, location, salary FROM JobOffer WHERE job_offer_id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Mettre à jour une offre d'emploi
function updateJobOffer($conn, $id, $data) {
    $stmt = $conn->prepare("UPDATE JobOffer SET title = ?, description = ?, location = ?, salary = ? WHERE job_offer_id = ?");
    return $stmt->execute([$data['title'], $data['description'], $data['location'], $data['salary'], $id]);
}

// Supprimer une offre d'emploi
function deleteJobOffer($conn, $id) {
    $stmt = $conn->prepare("DELETE FROM JobOffer WHERE job_offer_id = ?");
    return $stmt->execute([$id]);
}

// Gérer les différentes requêtes selon le HTTP
switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Si un ID est spécifié, récupérer cette offre
            $offer = getJobOfferById($conn, $_GET['id']);
            echo json_encode($offer ? $offer : ["message" => "Offre non trouvée"]);
        } else {
            // Sinon, récupérer toutes les offres
            echo json_encode(getJobOffers($conn));
        }
        break;

    case 'POST':
        if (createJobOffer($conn, $data)) {
            echo json_encode(["message" => "Offre créée avec succès."]);
        } else {
            echo json_encode(["message" => "Erreur lors de la création de l'offre."]);
        }
        break;

    case 'PUT':
        if (isset($_GET['id'])) {
            if (updateJobOffer($conn, $_GET['id'], $data)) {
                echo json_encode(["message" => "Offre mise à jour avec succès."]);
            } else {
                echo json_encode(["message" => "Erreur lors de la mise à jour de l'offre."]);
            }
        } else {
            echo json_encode(["message" => "ID de l'offre manquant."]);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            if (deleteJobOffer($conn, $_GET['id'])) {
                echo json_encode(["message" => "Offre supprimée avec succès."]);
            } else {
                echo json_encode(["message" => "Erreur lors de la suppression de l'offre."]);
            }
        } else {
            echo json_encode(["message" => "ID de l'offre manquant."]);
        }
        break;

    default:
        echo json_encode(["message" => "Méthode non autorisée."]);
        break;
}
?>
