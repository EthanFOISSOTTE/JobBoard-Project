<?php
require 'api/connect.php'; // Connexion à la Base de Données

// Préparer et exécuter la requête
$sql = "SELECT job_offer_id, title, description, location, salary FROM JobOffer"; // Ajout de job_offer_id
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

	<div class="container">
		<div class="job">
			<?php
            // Vérifier s'il y a des offres d'emplois dans la BDD
			if (count($results) > 0) {
                // Afficher chaque offre d'emplois
				foreach ($results as $offre) {
					echo "<div>";
					echo "<h2>" . htmlspecialchars($offre["title"]) . "</h2>";

					$description = htmlspecialchars("Nous recherchons un " . $offre["title"]);
					echo "<p>" . $description . "</p>";

					echo "<button type='button' class='btn-offres' data-id='" . $offre["job_offer_id"] . "'>En savoir plus</button>";
					echo "</div>";
				}
			} else {
				echo "<p>Aucune offre d'emploi disponible pour le moment.</p>";
			}
			?>
		</div>

		<!-- Zone pour afficher les détails de l'offre -->
		<div class="details" id="details">
			<p>Sélectionnez une offre d'emploi pour voir les détails ici.</p>
		</div>
	</div>

	<script type="text/javascript">
		document.addEventListener('DOMContentLoaded', function() {
			const btns = document.querySelectorAll('.btn-offres');
			btns.forEach(btn => {
				btn.addEventListener('click', function() {
					const id = this.getAttribute('data-id');

                // Requête AJAX pour récupérer les détails de l'offre
					fetch('api/job_offer.php?id=' + id)
					.then(response => response.json())
					.then(data => {
						if (data) {
							document.getElementById('details').innerHTML = `
							<h2>${data.title}</h2>
							<p>${data.description}</p>
							<p><strong>Location:</strong> ${data.location}</p>
							<p><strong>Salary:</strong> $${data.salary}</p>
							`;
						} else {
							document.getElementById('details').innerHTML = '<p>Erreur lors de la récupération des détails.</p>';
						}
					})
					.catch(error => console.error('Erreur:', error));
				});
			});
		});
	</script>

</body>
</html>
