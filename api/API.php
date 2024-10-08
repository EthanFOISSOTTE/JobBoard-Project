<?php
header("Content-Type: application/json");
require 'Connect.php'; // Connexion à la Base de Données

// Définir la méthode HTTP (CRUD)
$method = $_SERVER['REQUEST_METHOD'];

// Récupérer les données JSON et les décoder pour les utiliser dans la BDD
$data = json_decode(file_get_contents("php://input"), true);

// Fonction pour récupérer toutes les offres d'emploi
function getJobOffers($conn) {
    $stmt = $conn->prepare("
        SELECT 
            offers.offre_id,
            offers.job_title,
            offers.short_description,
            offers.job_location,
            offers.salary,
            offers.markdown_file,
            offers.work_time,
            offers.is_blocked,
            offers.created_at,
            companies.company_name
        FROM 
            offers
        JOIN 
            companies ON offers.company_id = companies.company_id
    ");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Fonction pour créer une nouvelle offre d'emploi
function createJobOffer($conn, $data) {
    $stmt = $conn->prepare("
        INSERT INTO offers (job_title, short_description, job_location, salary, work_time, company_id) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    return $stmt->execute([
        $data['job_title'],
        $data['short_description'],
        $data['job_location'],
        $data['salary'],
        $data['work_time'],
        $data['company_id']
    ]);
}

// Fonction pour enregistrer un utilisateur
function registerUser($conn, $data) {
    // Vérifier si tous les champs requis sont présents
    if (!isset($data['first_name'], $data['last_name'], $data['email'], $data['password'])) {
        return ["success" => false, "message" => "Données manquantes"];
    }

    // Vérifier si l'email est déjà utilisé
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    
    if ($stmt->rowCount() > 0) {
        return ["success" => false, "message" => "Cet email est déjà utilisé."];
    }

    // Hash du mot de passe
    $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);

    // Insérer l'utilisateur dans la table `users`
    $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)");
    $userInserted = $stmt->execute([
        $data['first_name'],
        $data['last_name'],
        $data['email'],
        $data['phone'] ?? null
    ]);

    if ($userInserted) {
        $userId = $conn->lastInsertId();

        // Insérer le mot de passe haché dans la table `passwords`
        $stmt = $conn->prepare("INSERT INTO passwords (user_id, password_hash) VALUES (?, ?)");
        $passwordInserted = $stmt->execute([$userId, $passwordHash]);

        if ($passwordInserted) {
            return ["success" => true, "message" => "Inscription réussie !"];
        } else {
            return ["success" => false, "message" => "Erreur lors de l'enregistrement du mot de passe."];
        }
    } else {
        return ["success" => false, "message" => "Erreur lors de l'enregistrement de l'utilisateur."];
    }
}

// Autres fonctions pour gérer les offres (récupération, mise à jour et suppression) ici...
function getJobOfferById($conn, $id) { /* Code existant */ }
function updateJobOffer($conn, $id, $data) { /* Code existant */ }
function deleteJobOffer($conn, $id) { /* Code existant */ }

// Gestion des différentes requêtes HTTP
switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Récupérer une offre spécifique
            $offer = getJobOfferById($conn, $_GET['id']);
            echo json_encode($offer ? $offer : ["message" => "Offre non trouvée"]);
        } else {
            // Récupérer toutes les offres
            echo json_encode(getJobOffers($conn));
        }
        break;

    case 'POST':
        if (isset($data['type']) && $data['type'] === 'job_offer') {
            // Créer une offre d'emploi
            if (createJobOffer($conn, $data)) {
                echo json_encode(["message" => "Offre créée avec succès."]);
            } else {
                echo json_encode(["message" => "Erreur lors de la création de l'offre."]);
            }
        } elseif (isset($data['type']) && $data['type'] === 'user_registration') {
            // Inscrire un nouvel utilisateur
            $result = registerUser($conn, $data);
            echo json_encode($result);
        } else {
            echo json_encode(["message" => "Type de requête non supporté."]);
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
