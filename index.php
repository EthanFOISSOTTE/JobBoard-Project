<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Job Board</title>
	<link rel="stylesheet" href="styles/style.css">
</head>
<body>
	<?php
	include 'variables-bdd.php';

	try {
		// Création d'une nouvelle instance PDO
		$bdd = new PDO("mysql:host=$bdd_host;dbname=$bdd_name;charset=utf8", $bdd_user, $bdd_pass);
		// Définir le mode d'erreur PDO sur Exception
		$bdd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	
		// Préparation de la requête pour récupérer les 10 premières lignes de la table 'joboffer'
		$requete = $bdd->prepare("SELECT * FROM joboffer LIMIT 10");

		// Exécution de la requête
		$requete->execute();

		// Récupération des résultats
		$resultats = $requete->fetchAll(PDO::FETCH_ASSOC);

		// Affichage des résultats
		foreach ($resultats as $offre) {
			// Afficher chaque offre d'emploi (ajustez selon la structure de vos données)
			echo "
				<div class='offres'>
					<h1>".$offre['title']."</h1>
					<p>".$offre['description']."<p>
					<button>learn more</button>
				</div>
			";
		}

	} catch (PDOException $e) {
		// En cas d'erreur, affichage du message
		die("Erreur : " . $e->getMessage());
	}
	?>
</body>
</html>
