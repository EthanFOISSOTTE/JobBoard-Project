<?php
require 'api/Connect.php';

// Récupérer toutes les offres d'emploi
$sql = "SELECT job_offer_id, title, description, location, salary, company_id FROM JobOffer";
$stmt = $conn->prepare($sql);
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Gestion des Offres d'Emploi</title>
    <link rel="stylesheet" href="csstemp.css">
</head>
<body>

<h1>Gestion des Offres d'Emploi</h1>

<section>
    <h2>Créer une nouvelle offre d'emploi</h2>
    <form id="createForm">
        <label for="title">Titre :</label>
        <input type="text" id="title" name="title" required>
        
        <label for="description">Description :</label>
        <textarea id="description" name="description" required></textarea>
        
        <label for="location">Lieu :</label>
        <input type="text" id="location" name="location" required>
        
        <label for="salary">Salaire :</label>
        <input type="number" id="salary" name="salary" required>
        
        <label for="company_id">ID de l'Entreprise :</label>
        <input type="number" id="company_id" name="company_id" required>
        
        <button type="submit">Créer l'Offre</button>
        <p id="createMessage"></p>
    </form>
</section>

<section>
    <h2>Offres d'Emploi</h2>
    <div id="jobOffers">
        <?php foreach ($results as $offre): ?>
        <div class="job-offer">
            <h3><?= htmlspecialchars($offre['title']) ?></h3>
            <p><strong>Description :</strong> <?= htmlspecialchars($offre['description']) ?></p>
            <p><strong>Lieu :</strong> <?= htmlspecialchars($offre['location']) ?></p>
            <p><strong>Salaire :</strong> $<?= htmlspecialchars($offre['salary']) ?></p>
            <button onclick="populateEditForm(<?= $offre['job_offer_id'] ?>)">Modifier</button>
            <button onclick="deleteJobOffer(<?= $offre['job_offer_id'] ?>)">Supprimer</button>
        </div>
        <?php endforeach; ?>
    </div>
</section>

<script>
// Créer une offre d'emploi
document.getElementById("createForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        location: document.getElementById("location").value,
        salary: document.getElementById("salary").value,
        company_id: document.getElementById("company_id").value
    };

    fetch('api/job_offer.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("createMessage").innerText = data.message;
        loadJobOffers();
    });
});

// Charger les offres d'emploi
function loadJobOffers() {
    fetch('api/API.php')
        .then(response => response.json())
        .then(data => {
            const jobOffersDiv = document.getElementById("jobOffers");
            jobOffersDiv.innerHTML = '';
            data.forEach(offre => {
                jobOffersDiv.innerHTML += `
                    <div class="job-offer">
                        <h3>${offre.title}</h3>
                        <p><strong>Description :</strong> ${offre.description}</p>
                        <p><strong>Lieu :</strong> ${offre.location}</p>
                        <p><strong>Salaire :</strong> $${offre.salary}</p>
                        <button onclick="populateEditForm(${offre.job_offer_id})">Modifier</button>
                        <button onclick="deleteJobOffer(${offre.job_offer_id})">Supprimer</button>
                    </div>
                `;
            });
        });
}

// Supprimer une offre d'emploi
function deleteJobOffer(id) {
    fetch('api/API.php?id=' + id, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadJobOffers();
        });
}

// Remplir le formulaire pour modification
function populateEditForm(id) {
    fetch('api/API.php?id=' + id)
        .then(response => response.json())
        .then(data => {
            document.getElementById("title").value = data.title;
            document.getElementById("description").value = data.description;
            document.getElementById("location").value = data.location;
            document.getElementById("salary").value = data.salary;
            document.getElementById("company_id").value = data.company_id;
            
            // Remplacer le bouton créer par un bouton pour mettre à jour
            document.getElementById("createForm").innerHTML += `<button type="button" onclick="updateJobOffer(${id})">Enregistrer les Modifications</button>`;
        });
}

// Mettre à jour une offre d'emploi
function updateJobOffer(id) {
    const formData = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        location: document.getElementById("location").value,
        salary: document.getElementById("salary").value,
        company_id: document.getElementById("company_id").value
    };

    fetch('api/API.php?id=' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadJobOffers();
    });
}
</script>

</body>
</html>
