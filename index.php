<?php
require 'connect.php'; // Connexion à la Base de Données

// Préparer et exécuter la requête
$sql = "SELECT title, description, location, salary FROM joboffer";
$stmt = $conn->prepare($sql);
$stmt->execute();

// Récupérer tous les résultats
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" type="text/css" href="index.css">
	<title>Job Board</title>
</head>
<body>
	<h1>Offres d'emplois</h1>

	<div class="job">
		<?php
		// Vérifier s'il y a des offres d'emplois dans la BDD
		if (count($results) > 0) {
		    // Afficher chaque offres d'emplois
		    foreach ($results as $row) {
		        echo "<div>";
		        echo "<h2>" . htmlspecialchars($row["title"]) . "</h2>";

		        $description = htmlspecialchars("Nous recherchons un " . $row["title"]);
		        echo "<p>" . $description . "</p>";

		        // // Limite la taille d'affichage de description
		        // $description = htmlspecialchars($row["description"]);
		        // if (strlen($description) > 35) {
		        //     $description = substr($description, 0, 35) . "...";
		        // }
		        // echo "<p>" . $description . "</p>";

		        // echo "<p><strong>Location :</strong> " . htmlspecialchars($row["location"]) . "</p>";
		        // echo "<p><strong>Salary :</strong> $" . htmlspecialchars($row["salary"]) . "</p>";

		        echo "<button type='button' id='more'>En savoir plus</button>";
		        echo "</div>";
		    }
		} else {
		    echo "<p>Aucune offre d'emploi disponible pour le moment.</p>";
		}
		?>
	</div>
</body>
</html>
