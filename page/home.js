//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║Titre : home.js                                                    ║
//  ║Description : C'est l'accueil du site, permet de visualisé les     ║
//  ║              offres sans être connecter                           ║
//  ║Auteur : FOISSOTTE Ethan / HARQUET Pol-Mattis                      ║
//  ║Date : 17/10/2024 (modification)                                   ║
//  ║Version : 2.1 (Ajout de commentaires)                              ║
//  ╚═══════════════════════════════════════════════════════════════════╝

// INDEX : AFFICHAGE DU TABLEAU PRINCIPAL DES OFFRES [17 - 64]
//         AFFICHAGE DU TABLEAU DETAIL DES OFFRES [65 - 149]
//         VERIFICATION DE LA SESSION [150 - 177]


document.addEventListener("DOMContentLoaded", async function() {

//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║             AFFICHAGE DU TABLEAU PRINCIPAL DES OFFRES             ║
//  ╚═══════════════════════════════════════════════════════════════════╝


    // Fonction pour récupérer les données de l'API
    async function loadData(apiUrl, postData = null) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: postData ? JSON.stringify(postData) : null
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    // Stockage des données d'offres pour filtrage
    let allOffers = [];

    // Fonction pour afficher les offres principales
    function displayData(data) {
        const dataBody = document.getElementById("job");
        dataBody.innerHTML = ''; // On vide le conteneur d'offres

        // Affichage du tableau des offres principales sur la page
        data.forEach(offer => {
            const row = document.createElement("div");
            row.classList.add("job");
            row.innerHTML = `
                <h2>${offer.job_title}</h2>
                <p>${offer.short_description}</p>
                <button class="btn-offres" data-id="${offer.offre_id}">En savoir plus</button>
            `;
            dataBody.appendChild(row);

            // Ajout de l'événement au bouton pour afficher les détails de l'offre
            row.querySelector('.btn-offres').addEventListener('click', function() {
                showOfferDetails(offer);
            });
        });
    }

//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║             AFFICHAGE DU TABLEAU DETAIL DES OFFRES                ║
//  ╚═══════════════════════════════════════════════════════════════════╝


    // Fonction pour afficher les détails de l'offre après le clic bouton
    function showOfferDetails(offer) {
        const detailBody = document.getElementById("details");
        // Affichage du tableau détails
        detailBody.innerHTML = ` 
            <p id='markdown-file'>${offer.markdown_file}</p>
            <p><strong>Location:</strong> ${offer.job_location}</p>
            <p><strong>Salary:</strong> ${offer.salary} ₳</p>
            <p><strong>Work Time:</strong> ${offer.work_time}</p>
            <textarea id="application-message" placeholder="Écrivez votre message de candidature ici..."></textarea>
            <button class="btn-postuler" data-id="${offer.offre_id}">Postuler</button>
        `;
        // Affichage du style d'écriture du markdown_file
        const markdownFile = document.getElementById('markdown-file');
        const htmlContent = marked.parse(offer.markdown_file);
        markdownFile.innerHTML = htmlContent;

        // Ajout de l'événement au bouton "Postuler"
        detailBody.querySelector('.btn-postuler').addEventListener('click', async function() {
            // Vérification si l'utilisateur est connecté
            const userId = sessionStorage.getItem("user_id");
            if (!userId) {
                alert("Veuillez vous connecter pour postuler à cette offre.");
                return;
            }

            // Récupération du message depuis la zone de texte
            const message = document.getElementById("application-message").value.trim();
            if (!message) {
                alert("Veuillez entrer un message de candidature.");
                return; // Annuler si l'utilisateur ne saisit pas de message
            }

            // Préparation des données de candidature pour toutes les expédier dans la BDD
            const applicationData = {
                offre_id: offer.offre_id,
                user_id: userId,
                message: message,
                status: "waiting",
                created_at: new Date().toISOString()
            };

            // Envoi des données de candidature à l'API (pour la BDD)
            const result = await loadData('../api/api.php?request=application&method=post', applicationData);
            if (result) {
                alert("Votre candidature a été soumise avec succès !");
            }
        });
    }

    // Récupération des données de l'offre
    const offers_data = await loadData('../api/api.php?request=offer&method=get');
    if (!offers_data || !Array.isArray(offers_data)) {
        console.log("Erreur lors de la récupération des données de l'offre.");
        return;
    }
    // Stocker toutes les offres pour le filtrage
    allOffers = offers_data;

    // Afficher les données
    displayData(offers_data);

    // Ajout d'un événement pour le filtrage
    document.getElementById("filter-button").addEventListener("click", function() {
        const filterValue = document.getElementById("filter-input").value.toLowerCase();
        const filteredOffers = allOffers.filter(offer => {
            return offer.job_title.toLowerCase().includes(filterValue) || 
                   offer.short_description.toLowerCase().includes(filterValue);
        });
        displayData(filteredOffers);
    });

    // Récupérer l'utilisateur connecté
    const user_data = await loadData("../api/api.php?request=user&method=get", { user_id: sessionStorage.getItem("user_id") });
    if (!user_data || !Array.isArray(user_data)) {
        console.log("Erreur lors de la récupération des données de l'utilisateur.");
        return;
    }


//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║                    VERIFICATION DE LA SESSION                     ║
//  ╚═══════════════════════════════════════════════════════════════════╝


    // Vérification de l'utilisateur connecté
    if (sessionStorage.getItem("user_id")) {
        // Afficher l'id de l'utilisateur
        document.getElementById("conecter").innerText = "Connecté en tant que " + user_data[0].user_id;
        // Afficher le bouton de déconnexion et le lien profil
        document.getElementById("insc-link").style.display = "none";
        document.getElementById("conn-link").style.display = "none";
        document.getElementById("deco-link").style.display = "block";
        document.getElementById("profil-link").style.display = "block";

        // Vérifie le rôle de l'utilisateur pour faire apparaître un bouton spécifique
        switch (user_data[0].role) {
            case "admin":
                document.getElementById("admin-link").style.display = "block";
                break;
            case "compagnie":
                document.getElementById("dash-link").style.display = "block";
                break;
            case "applicant":
                document.getElementById("userdash-link").style.display = "block";
                break;
        }
    }
});