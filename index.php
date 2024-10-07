<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Job Board</title>
</head>
<body>
	<?php
	include 'variables-bdd.php';

	try {
		// Création d'une nouvelle instance PDO
		$bdd = new PDO("mysql:host=$bdd_host;dbname=$bdd_name;charset=utf8", $bdd_user, $bdd_pass);
		// Définir le mode d'erreur PDO sur Exception
		$bdd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		// Connexion réussie à la base de données
		echo "Connexion réussie à la base de données.";
	} catch (PDOException $e) {
		// En cas d'erreur, affichage du message
		die("Erreur : " . $e->getMessage());
	}
	?>
</body>
</html>
