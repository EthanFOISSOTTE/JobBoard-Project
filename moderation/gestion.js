//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║Titre : gestion.js                                                 ║
//  ║Description :                                                      ║
//  ║Auteur : FOISSOTTE Ethan / HARQUET Pol-Mattis                      ║
//  ║Date : 15/10/2024                                                  ║
//  ║Version : 2.4 (Commentaires complet + index)                       ║
//  ╚═══════════════════════════════════════════════════════════════════╝

// INDEX : INITIALISATION DE LA SESSION [18 - 40]
//         INITIALISATION DE L'AFFICHAGE DES TABLEAUX [41 - 71]
//         INITIALISATION DE LA BARRE DE RECHERCHE [72 - 98]
//         INITIALISATION DU TABLEAU ET DES ACTIONS UTILISATEUR [99 - 377]
//         INITIALISATION DU TABLEAU ET DES ACTIONS OFFRE [378 - 570]
//         INITIALISATION DU TABLEAU ET DES ACTIONS ENTREPRISE [571 - 765]

document.addEventListener("DOMContentLoaded", function() {

//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║                   INITIALISATION DE LA SESSION                    ║
//  ╚═══════════════════════════════════════════════════════════════════╝

    //-------------------------------------------------------------------
    // Vérifie si l'utilisateur est un admin sinon -> Accueil
    //-------------------------------------------------------------------
    const firstName = sessionStorage.getItem("first_name");
    const role = sessionStorage.getItem("role");

    if (role === "admin") {
        document.getElementById("test").textContent = "Bonjour Administrateur " + firstName; // Politesse
    } else {
        window.location.href = "../page/home.html";
        return; // arrête l'exécution du script si non-admin
    }

    //-------------------------------------------------------------------
    // Variables globales (sinon ça fout le bordel)
    //-------------------------------------------------------------------
    const companyMap = {}; // Pour stocker la correspondance entre company_id et company_name
    const userMap = {};    // Pour stocker la correspondance entre user_id et "nom complet de l'utilisateur"

//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║            INITIALISATION DE L'AFFICHAGE DES TABLEAUX             ║
//  ╚═══════════════════════════════════════════════════════════════════╝

    //-------------------------------------------------------------------
    // Création des options pour le "select" de la page
    //-------------------------------------------------------------------
    const selectElement = document.getElementById("dataSelect");

    const options = ["Utilisateurs", "Offres", "Entreprises"];
    options.forEach(optionText => {
        const option = document.createElement("option");
        option.value = optionText;
        option.textContent = optionText;
        selectElement.appendChild(option);
    });

    selectElement.addEventListener("change", async function() {
        const selectedOption = this.value;
    document.getElementById("affichage").innerHTML = ''; // Efface l'affichage précédent

    if (selectedOption === "Utilisateurs") {
        await loadUsers();  // Attendre que les utilisateurs soient chargés
    } else if (selectedOption === "Offres") {
        loadCompanyMap(() => loadOffers()); // Charge d'abord les entreprises puis les offres
    } else if (selectedOption === "Entreprises") {
        loadUserMap(() => loadCompanies()); // Charge d'abord les utilisateurs puis les entreprises
    }
});


//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║             INITIALISATION DE LA BARRE DE RECHERCHE               ║
//  ╚═══════════════════════════════════════════════════════════════════╝


    //-------------------------------------------------------------------
    // Écouteur d'événements pour le champ de recherche
    //-------------------------------------------------------------------
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function() {
            const query = this.value.toLowerCase();
            const currentOption = selectElement.value;

            if (currentOption === "Utilisateurs") {
                filterUsers(query);
            } else if (currentOption === "Offres") {
                filterOffers(query);
            } else if (currentOption === "Entreprises") {
                filterCompanies(query);
            }
        });
    } else {
        console.error("L'élément #searchInput est introuvable.");
    }


//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║       INITIALISATION DU TABLEAU ET DES ACTIONS UTILISATEUR        ║
//  ╚═══════════════════════════════════════════════════════════════════╝


    //-------------------------------------------------------------------
    // Fonctions de chargement des données utilisateur
    //-------------------------------------------------------------------

    async function loadUsers() {
        try {
            const response = await fetch('../api/api.php?request=user&method=get');
            const users = await response.json();

            if (!users || !Array.isArray(users)) {
                console.error("Erreur lors de la récupération des données utilisateurs.");
                return;
            }

            const affichageDiv = document.getElementById("affichage");
            affichageDiv.innerHTML = '';

            createUserTable(users);

        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
        }
    }

    //-------------------------------------------------------------------
    // Fonctions de création du tableau d'affichage des utilisateurs
    //-------------------------------------------------------------------

    function createUserTable(users) {
        const affichageDiv = document.getElementById("affichage");
        const tableContainer = document.createElement("div");
        const titleElem = document.createElement("h2");
        titleElem.textContent = "Utilisateurs";
        tableContainer.appendChild(titleElem);

        const table = document.createElement("table");
        table.innerHTML = `
        <tr>
        <th>ID Utilisateur</th>
        <th>Nom</th>
        <th>Prénom</th>
        <th>Email</th>
        <th>Téléphone</th>
        <th>Status</th>
        <th>Rôle</th>
        <th>Actions</th>
        </tr>
        `;

        users.forEach(user => {
            const row = document.createElement("tr");

            const statusSelect = document.createElement("select");
            ["Bloqué", "Débloqué"].forEach(statusOption => {
                const option1 = document.createElement("option");
                option1.value = statusOption;
                option1.textContent = statusOption;
                if (user.is_blocked === (statusOption === 'Bloqué' ? 1 : 0)) {
                    option1.selected = true;
                }
                statusSelect.appendChild(option1);
            });

            statusSelect.addEventListener("change", function() {
                const newStatus = this.value;
                if ((newStatus === "Bloqué" && user.is_blocked === 0) || (newStatus === "Débloqué" && user.is_blocked === 1)) {
                    const confirmChange = confirm(`Confirmez-vous le changement de statut de ${user.first_name} ${user.last_name} à ${newStatus} ?`);
                    if (confirmChange) {
                        updateUserStatus(user.user_id, newStatus, user); // Passer les données de l'utilisateur
                    } else {
                        this.value = user.is_blocked ? "Bloqué" : "Débloqué"; // Rétablir l'option précédente
                    }
                }
            });

            //-------------------------------------------------------------------
            // Permet de changer le role de l'utilisateur via un select
            //-------------------------------------------------------------------

            const roleSelect = document.createElement("select");
            ["admin", "compagnie", "applicant"].forEach(roleOption => {
                const option = document.createElement("option");
                option.value = roleOption;
                option.textContent = roleOption;
                if (roleOption === user.role) {
                    option.selected = true;
                }
                roleSelect.appendChild(option);
            });

            //-------------------------------------------------------------------
            // La confirmation de changement de role, un missclick serait con...
            //-------------------------------------------------------------------

            roleSelect.addEventListener("change", function() {
                const newRole = this.value;
                if (newRole !== user.role) {
                    const confirmChange = confirm(`Confirmez-vous le changement de rôle de ${user.first_name} ${user.last_name} de ${user.role} à ${newRole} ?`);
                    if (confirmChange) {
                        updateUserRole(user.user_id, newRole, user); // Passer les données de l'utilisateur
                    } else {
                        this.value = user.role; // Rétablir l'option précédente
                    }
                }
            });

            //-------------------------------------------------------------------
            // La même chose mais pour suppr, imagine tu suppr un admin, aie aie
            //-------------------------------------------------------------------

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Supprimer";
            deleteButton.addEventListener("click", function() {
                const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.first_name} ${user.last_name} ?`);
                if (confirmDelete) {
                    deleteUser(user.user_id);
                }
            });

            //-------------------------------------------------------------------
            // Le tableaux d'affichage, évidemment
            //-------------------------------------------------------------------

            row.innerHTML = `
            <td>${user.user_id}</td>
            <td>${user.last_name}</td>
            <td>${user.first_name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            `;

            const statusCell = document.createElement("td");
            statusCell.appendChild(statusSelect);
            row.appendChild(statusCell);

            const roleCell = document.createElement("td");
            roleCell.appendChild(roleSelect);
            row.appendChild(roleCell);

            const actionsCell = document.createElement("td");
            actionsCell.appendChild(deleteButton);
            row.appendChild(actionsCell);

            table.appendChild(row);
        });

        tableContainer.appendChild(table);
        affichageDiv.appendChild(tableContainer);
    }

    //-------------------------------------------------------------------
    // Fonctions pour la gestion des utilisateurs (role / statut et supp)
    //-------------------------------------------------------------------

    async function updateUserRole(userId, newRole, user) {
        try { // Ceci va garder les données de l'utilisateur pour les renvoyées dans la BDD, pour la modif de role
            const updatedUserData = {
                user_id: userId,
                last_name: user.last_name,
                first_name: user.first_name,
                email: user.email,
                phone: user.phone,
                role: newRole,
                is_blocked: user.is_blocked
            };

            const response = await fetch(`../api/api.php?request=user&method=put`, {
                method: 'PUT',
                body: JSON.stringify(updatedUserData),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            if (response.ok) {
                alert("Le rôle a été mis à jour avec succès !");
                loadUsers();
            } else {
                alert("Erreur lors de la mise à jour du rôle : " + result.message);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du rôle:", error);
        }
    }

    async function updateUserStatus(userId, newStatus, user) {
        try { // Ceci va garder les données de l'utilisateur pour les renvoyées dans la BDD, pour la modif de status
            const updatedUserData = {
                user_id: userId,
                last_name: user.last_name,
                first_name: user.first_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                is_blocked: newStatus === "Bloqué" ? 1 : 0
            };

            const response = await fetch('../api/api.php?request=user&method=put', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUserData)
            });

            const result = await response.json();
            if (result.success) {
                user.is_blocked = updatedUserData.is_blocked;
                alert(`Statut de l'utilisateur ${user.first_name} ${user.last_name} mis à jour avec succès.`);
            } else {
                alert("Erreur lors de la mise à jour du statut.");
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut:", error);
        }
    }

    async function deleteUser(userId) {
        try {
            const response = await fetch(`../api/api.php?request=user&method=delete`, {
                method: 'DELETE',
                body: JSON.stringify({ user_id: userId }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            if (response.ok) {
                alert("Utilisateur supprimé avec succès !");
                loadUsers(); // Rafraîchir la liste des utilisateurs
            } else {
                alert("Erreur lors de la suppression de l'utilisateur : " + result.message);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de l'utilisateur:", error);
        }
    }

    //-------------------------------------------------------------------
    // Fonctions de filtrage (recherches) des utilisateurs
    //-------------------------------------------------------------------
    function filterUsers(query) {
    console.log("Requête de recherche:", query);  // Débogage car ... débogage

    const userRows = document.querySelectorAll("#affichage table tr");

    userRows.forEach((row, index) => {
        if (index === 0) return; // Ignorer l'en-tête (on l'aime pas toute façon)
        const cells = row.querySelectorAll("td");
        const userData = Array.from(cells).map(cell => cell.textContent.toLowerCase());
        
        const isVisible = userData.some(data => data.includes(query));
        row.style.display = isVisible ? "" : "none";
        
        console.log("Ligne trouvée:", userData, "Visible:", isVisible);  // Débogage, encore et toujours
    });
}

    async function loadUserMap(callback) {
        try { // La correspondance entre user_id et "nom complet de l'utilisateur"
            const response = await fetch('../api/api.php?request=user&method=get');
            const users = await response.json();

            users.forEach(user => {
                userMap[user.user_id] = `${user.first_name} ${user.last_name}`;
            });

            if (callback) callback();
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs:", error);
        }
    }


//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║          INITIALISATION DU TABLEAU ET DES ACTIONS OFFRE           ║
//  ╚═══════════════════════════════════════════════════════════════════╝

    //-------------------------------------------------------------------
    // Fonctions de chargement des données offre
    //-------------------------------------------------------------------

    async function loadOffers() {
    try {
        const response = await fetch('../api/api.php?request=offer&method=get');
        const offers = await response.json();

        if(!offers || !Array.isArray(offers)) {
            console.error("Erreur lors de la récupération des données offres.");
            return;
        }

        const affichageDiv = document.getElementById("affichage");
        affichageDiv.innerHTML = '';

        console.log("Première étape réussit");
        createOffersTable(offers);

    } catch (error) {
        console.error("Erreur lors de la récupération des offres:", error);
    }
}

    //-------------------------------------------------------------------
    // Fonctions de création du tableau d'affichage des offres
    //-------------------------------------------------------------------

    function createOffersTable(offers) {
    const affichageDiv = document.getElementById("affichage");
    const tableContainer = document.createElement("div");
    const titleElem = document.createElement("h2");
    titleElem.textContent = "Offres";
    tableContainer.appendChild(titleElem);

    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";
    table.innerHTML = `
    <tr>
    <th>ID Offre</th>
    <th>Entreprise</th>
    <th>Titre</th>
    <th>Description courte</th>
    <th>Description complète</th>
    <th>Tags</th>
    <th>Localisation</th>
    <th>Salaire</th>
    <th>Durée</th>
    <th>Status</th>
    <th>Actions</th>
    </tr>
    `;

    offers.forEach(offer => {
        const row = document.createElement("tr");
        const companyName = companyMap[offer.company_id] || "Entreprise inconnue";

        const statusSelect = document.createElement("select");
        ["Bloqué", "Débloqué"].forEach(statusOption => {
            const option = document.createElement("option");
            option.value = statusOption;
            option.textContent = statusOption;
            if (offer.is_blocked === (statusOption === 'Bloqué' ? 1 : 0)) {
                option.selected = true;
            }
            statusSelect.appendChild(option);
        });

        statusSelect.addEventListener("change", function() {
            const newStatus = this.value;
            if ((newStatus === "Bloqué" && offer.is_blocked === 0) || (newStatus === "Débloqué" && offer.is_blocked === 1)) {
                const confirmChange = confirm(`Confirmez-vous le changement de status de ${offer.job_title} à ${newStatus} ?`);
                if (confirmChange) {
                    updateOfferStatus(offer.offre_id, newStatus, offer);
                } else {
                    this.value = offer.is_blocked ? "Bloqué" : "Débloqué";
                }
            }
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Supprimer";
        deleteButton.addEventListener("click", function() {
            const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer l'offre ${offer.job_title} ?`);
            if (confirmDelete) {
                deleteOffer(offer.offre_id);
            }
        });

        row.innerHTML = `
        <td>${offer.offre_id}</td>
        <td>${companyName}</td>
        <td>${offer.job_title}</td>
        <td>${offer.short_description}</td>
        <td>${offer.markdown_file}</td>
        <td>${offer.tags}</td>
        <td>${offer.job_location}</td>
        <td>${offer.salary}</td>
        <td>${offer.work_time}</td>
        `;

        const statusCell = document.createElement("td");
        statusCell.appendChild(statusSelect);
        row.appendChild(statusCell);

        const actionsCell = document.createElement("td");
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);

        table.appendChild(row);
    });

    tableContainer.appendChild(table);
    affichageDiv.appendChild(tableContainer);
}

    //-------------------------------------------------------------------
    // Fonctions pour la gestion des utilisateurs
    //-------------------------------------------------------------------

    async function updateOfferStatus(offerId, newStatus, offer) {
    try {
        const updateOfferData = {
            offre_id: offerId,
            company_id: offer.company_id,
            job_title: offer.job_title,
            short_description: offer.short_description,
            markdown_file: offer.markdown_file,
            tags: offer.tags,
            job_location: offer.job_location,
            salary: offer.salary,
            work_time: offer.work_time,
            is_blocked: newStatus === "Bloqué" ? 1 : 0
        };

        const response = await fetch('../api/api.php?request=offer&method=put', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateOfferData)
        });

        const result = await response.json();
        if (result.success) {
            offer.is_blocked = updateOfferData.is_blocked;
            alert(`Statut de l'offre ${offer.job_title} mis à jour avec succès.`);
        } else {
            alert("Erreur lors de la mise à jour du statut.");
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
    }
}


    async function deleteOffer(offerId) {
    try {
        const response = await fetch(`../api/api.php?request=offer&method=delete`, {
            method: 'DELETE',
            body: JSON.stringify({ offre_id: offerId }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (response.ok) {
            alert("Offre supprimé avec succès !");
                loadOffers(); // Rafraîchir la liste des utilisateurs
            } else {
                alert("Erreur lors de la suppression de l'offre : " + result.message);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de l'offre:", error);
        }
}

    function filterOffers(query) {
        const offerRows = document.querySelectorAll("#affichage table tr");
        offerRows.forEach((row, index) => {
            if (index === 0) return; // Ignorer l'en-tête
            const cells = row.querySelectorAll("td");
            const offerData = Array.from(cells).map(cell => cell.textContent.toLowerCase());
            const isVisible = offerData.some(data => data.includes(query));
            row.style.display = isVisible ? "" : "none";
        });
}

//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║         INITIALISATION DU TABLEAU ET DES ACTIONS ENTREPRISE       ║
//  ╚═══════════════════════════════════════════════════════════════════╝

    //-------------------------------------------------------------------
    // Fonctions de chargement des données entreprise
    //-------------------------------------------------------------------

    async function loadCompanies() {
    try {
        const response = await fetch('../api/api.php?request=company&method=get');
        const companies = await response.json();

        if(!companies || !Array.isArray(companies)) {
            console.error("Erreur lors de la récupération des données offres.");
            return;
        }

        const affichageDiv = document.getElementById("affichage");
        affichageDiv.innerHTML = '';

        console.log("Première étape réussit");
        createcompanysTable(companies);

    } catch (error) {
        console.error("Erreur lors de la récupération des offres:", error);
    }
}

    //-------------------------------------------------------------------
    // Fonctions de création du tableau d'affichage des entreprises
    //-------------------------------------------------------------------

    function createcompanysTable(companies) {
    const affichageDiv = document.getElementById("affichage");
    const tableContainer = document.createElement("div");
    const titleElem = document.createElement("h2");
    titleElem.textContent = "Entreprises";
    tableContainer.appendChild(titleElem);

    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";
    table.innerHTML = `
    <tr>
    <th>ID Entreprise</th>
    <th>Responsable</th>
    <th>Nom</th>
    <th>Description</th>
    <th>Site internet</th>
    <th>Status</th>
    <th>Actions</th>
    </tr>
    `;

    companies.forEach(company => {
        const row = document.createElement("tr");
        const responsableName = userMap[company.user_id] || "Responsable inconnu";

        const statusSelect = document.createElement("select");
        ["Bloqué", "Débloqué"].forEach(statusOption => {
            const option = document.createElement("option");
            option.value = statusOption;
            option.textContent = statusOption;
            if (company.is_blocked === (statusOption === 'Bloqué' ? 1 : 0)) {
                option.selected = true;
            }
            statusSelect.appendChild(option);
        });

        statusSelect.addEventListener("change", function() {
            const newStatus = this.value;
            if ((newStatus === "Bloqué" && company.is_blocked === 0) || (newStatus === "Débloqué" && company.is_blocked === 1)) {
                const confirmChange = confirm(`Confirmez-vous le changement de status de ${company.company_name} à ${newStatus} ?`);
                if (confirmChange) {
                    updatecompanyStatus(company.company_id, newStatus, company);
                } else {
                    this.value = company.is_blocked ? "Bloqué" : "Débloqué";
                }
            }
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Supprimer";
        deleteButton.addEventListener("click", function() {
            const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer l'entreprise ${company.company_name} ?`);
            if (confirmDelete) {
                deletecompany(company.company_id);
            }
        });

        row.innerHTML = `
        <td>${company.company_id}</td>
        <td>${responsableName}</td>
        <td>${company.company_name}</td>
        <td>${company.company_description}</td>
        <td>${company.company_website}</td>
        `;

        const statusCell = document.createElement("td");
        statusCell.appendChild(statusSelect);
        row.appendChild(statusCell);

        const actionsCell = document.createElement("td");
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);

        table.appendChild(row);
    });

    tableContainer.appendChild(table);
    affichageDiv.appendChild(tableContainer);
}

    //-------------------------------------------------------------------
    // Fonctions pour la gestion des entreprises
    //-------------------------------------------------------------------

    async function updatecompanyStatus(companyId, newStatus, company) {
    try {
        const updatecompanyData = {
            company_id: companyId,
            company_name: company.company_name,
            company_description: company.company_description,
            company_website: company.company_name,
            is_blocked: newStatus === "Bloqué" ? 1 : 0
        };

        const response = await fetch('../api/api.php?request=company&method=put', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatecompanyData)
        });

        const result = await response.json();
        if (result.success) {
            company.is_blocked = updatecompanyData.is_blocked;
            alert(`Statut de l'entreprise ${company.company_name} mis à jour avec succès.`);
        } else {
            alert("Erreur lors de la mise à jour du statut.");
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
    }
}


    async function deletecompany(companyId) {
    try {
        const response = await fetch(`../api/api.php?request=company&method=delete`, {
            method: 'DELETE',
            body: JSON.stringify({ company_id: companyId }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (response.ok) {
            alert("Entreprise supprimé avec succès !");
                loadCompanies(); // Rafraîchir la liste des utilisateurs
            } else {
                alert("Erreur lors de la suppression de l'entreprise : " + result.message);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de l'entreprise:", error);
        }
}

    function filterCompanies(query) {
        const companyRows = document.querySelectorAll("#affichage table tr");
        companyRows.forEach((row, index) => {
            if (index === 0) return; // Ignorer l'en-tête, encore
            const cells = row.querySelectorAll("td");
            const companyData = Array.from(cells).map(cell => cell.textContent.toLowerCase());
            const isVisible = companyData.some(data => data.includes(query));
            row.style.display = isVisible ? "" : "none";
        });
}

    async function loadCompanyMap(callback) {
        try {
            const response = await fetch('../api/api.php?request=company&method=get');
            const companies = await response.json();

            companies.forEach(company => {
                companyMap[company.company_id] = company.company_name;
            });

            if (callback) callback();
        } catch (error) {
            console.error("Erreur lors de la récupération des entreprises:", error);
        }
    }

});