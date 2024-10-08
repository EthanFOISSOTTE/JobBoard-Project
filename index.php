<?php
require 'api/Connect.php'; // Connexion à la Base de Données

// Préparer et exécuter la requête pour récupérer les offres d'emploi et les informations de l'entreprise
$sql = "
    SELECT 
        offers.offre_id, 
        offers.job_title, 
        offers.short_description, 
        offers.job_location, 
        offers.salary,
        offers.work_time,
        offers.markdown_file, 
        companies.company_name
    FROM 
        offers
    JOIN 
        companies ON offers.company_id = companies.company_id
";
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
    <h1>Offres d'emploi</h1>

    <a href="Profils/Inscription.php"><button type="button" class="sign-up">Inscription</button></a>
    <button type="button" class="sign-in">Connexion</button>

    <div class="container">
        <div class="job">
            <?php
            // Vérifier s'il y a des offres d'emplois dans la BDD
            if (count($results) > 0) {
                // Afficher chaque offre d'emploi
                foreach ($results as $offre) {
                    echo "<div>";
                    echo "<h2>" . htmlspecialchars($offre["job_title"]) . "</h2>";
                    
                    $description = htmlspecialchars("Nous recherchons un " . $offre["job_title"] . ".");
                    echo "<p>" . $description . "</p>";
                    
                    echo "<button type='button' class='btn-offres' data-id='" . $offre["offre_id"] . "'>En savoir plus</button>";
                    echo "</div>";
                }
            } else {
                echo "<p>Aucune offre d'emploi disponible pour le moment.</p>";
            }
            ?>
        </div>
        
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
                    fetch('api/API.php?id=' + id)
                    .then(response => response.json())
                    .then(data => {
                        if (data) {
                            document.getElementById('details').innerHTML = `
                                <h2>${data.job_title}</h2>
                                <p><strong>Description:</strong> ${data.markdown_file}</p>
                                <p><strong>Location:</strong> ${data.job_location}</p>
                                <p><strong>Salary:</strong> ${data.salary}€</p>
                                <p><strong>Durée:</strong> ${data.work_time}</p>
                                <p><strong>Company:</strong> ${data.company_name}</p>
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
