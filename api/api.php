<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once 'database.php';

$database = new Database();
$db = $database->getConnection();

// Récupérer les paramètres de requête
$request = isset($_GET['request']) ? $_GET['request'] : null;
$method = isset($_GET['method']) ? strtoupper($_GET['method']) : $_SERVER['REQUEST_METHOD']; // Méthode HTTP par défaut
$data = json_decode(file_get_contents("php://input"), true); // Pour récupérer les données envoyées via POST/PUT

// Routage basé sur le paramètre 'request'
switch ($request) {
    case 'user':
        include_once 'user_controller.php';
        $controller = new UserController($db);
        handleRequest($method, $controller, $data);
        break;

    case 'company':
        include_once 'company_controller.php';
        $controller = new CompanyController($db);
        handleRequest($method, $controller, $data);
        break;

    case 'offer':
        include_once 'offer_controller.php';
        $controller = new OfferController($db);
        handleRequest($method, $controller, $data);
        break;

    case 'application':
        include_once 'application_controller.php';
        $controller = new ApplicationController($db);
        handleRequest($method, $controller, $data);
        break;

    case 'notification':
        include_once 'notification_controller.php';
        $controller = new NotificationController($db);
        handleRequest($method, $controller, $data);
        break;

    case 'password':
        include_once 'password_controller.php';
        $controller = new PasswordController($db);
        handleRequest($method, $controller, $data);
        break;

    default:
        http_response_code(404);
        echo json_encode(array("message" => "Resource not found."));
        break;
}

// Fonction de gestion des requêtes selon la méthode (GET, POST, PUT, DELETE)
function handleRequest($method, $controller, $data) {
    switch ($method) {
        case 'GET':
            $controller->read($data);
            break;
        case 'POST':
            $controller->create($data);
            break;
        case 'PUT':
            $controller->update($data);
            break;
        case 'DELETE':
            $controller->delete($data);
            break;
        default:
            http_response_code(405);
            echo json_encode(array("message" => "Method not allowed"));
            break;
    }
}
?>
