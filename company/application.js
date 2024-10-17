//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║Titre : application.js                                             ║
//  ║Description : C'est la page de visualisation des candidatures      ║
//  ║Auteur : FOISSOTTE Ethan / HARQUET Pol-Mattis                      ║
//  ║Date : 17/10/2024 (modification)                                   ║
//  ║Version : 2.1 (Ajout de commentaires)                              ║
//  ╚═══════════════════════════════════════════════════════════════════╝

// INDEX : AFFICHAGE DES DONNEES DES OFFRES POSTER PAR L'ENTREPRISE [15- 35]
//         ACTIONS DE L'ENTREPRISE PAR RAPPORT AUX CANDIDATS DE L'OFFRE [36 - 93]
//         RECUPERATION DES DONNEES DU CANDIDAT, DE L'OFFRE, DE L'ENTREPRISE [94 - 239]


//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║      AFFICHAGE DES DONNEES DES OFFRES POSTER PAR L'ENTREPRISE     ║
//  ╚═══════════════════════════════════════════════════════════════════╝

// Fonction pour récupérer les données de l'API
async function loadData(apiUrl, postData = null) {
	try {
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(postData)
		});
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error: ", error);
	}
}

//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║		 ACTIONS DE L'ENTREPRISE PAR RAPPORT AUX CANDIDATS DE L'OFFRE   ║
//  ╚═══════════════════════════════════════════════════════════════════╝

// Fonction pour traiter une candidature (accepter ou rejeter)
async function handleApplication(applicationID, jobTitle, action) {
  // Demander une confirmation
  const actionText1 = action === "accepted" ? "accepter" : "rejeter";
  if (!confirm(`Êtes-vous sûr de vouloir ${actionText1} cette candidature ?`)) {
    return;
  }

  // Récupérer les données de la candidature du candidat
  const application_data = await loadData('../api/api.php?request=application&method=get', { application_id: applicationID });
  if (!application_data || !Array.isArray(application_data)) {
    console.log("Erreur lors de la récupération des données de la candidature.");
    return;
  }
  const application = application_data[0];

  // Mettre à jour le status de la candidature
  const postData = {
    offre_id: application.offre_id,
    user_id: application.user_id,
    message: application.message,
    status: action,
    application_id: applicationID,
  };
  const response = await loadData('../api/api.php?request=application&method=put', postData);
  if (!response || response.error) {
    console.log("Erreur lors de la mise à jour de la candidature.");
    return;
  } else {
    // Message de succès
 	 const actionText2 = action === "accepted" ? "acceptée" : "rejetée";
    console.log(`La candidature a été ${actionText2} avec succès !`);

    // Envoyer une notification à l'utilisateur
    const notificationData = {
      user_id: application.user_id,
      body: `Votre candidature à l'offre "${jobTitle}" a été ${actionText2}.`,
      is_seen: 0,
      is_archived: 0,
    };
    const notificationResponse = await loadData('../api/api.php?request=notification&method=post', notificationData);
    if (!notificationResponse || notificationResponse.error) {
      console.log("Erreur lors de l'envoi de la notification.");
      return;
    } else {
      // Message de succès
      console.log("Notification envoyée avec succès !");
    }

    // Rafraîchir la page
    location.reload();
  }
}

//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║	RECUPERATION DES DONNEES DU CANDIDAT, DE L'OFFRE, DE L'ENTREPRISE ║
//  ╚═══════════════════════════════════════════════════════════════════╝

document.addEventListener("DOMContentLoaded", async function() {
	let user = null;
	let company = null;

	if (sessionStorage.getItem("user_id")) {
		// Récupération des données utilisateurs
		const user_data = await loadData("../api/api.php?request=user&method=get");
		if (!user_data || !Array.isArray(user_data)) {
			console.log("Erreur lors de la récupération des données utilisateur.");
			return;
		}
		// Trouver l'utilisateur correspondant à l'ID stocké de la candidature
		user = user_data.find(u => u.user_id == sessionStorage.getItem("user_id"));

		if (user.role == "compagnie") {
			// Récupération des données de l'entreprise'
			const company_data = await loadData('../api/api.php?request=company&method=get');
			if (!company_data || !Array.isArray(company_data)) {
				console.log("Erreur lors de la récupération des données entreprise.");
				return;
			}
			// récupérer les données de l'entreprise du responsable
			company = company_data.find(c => c.user_id == user.user_id);
		} else {
			console.log("Utilisateur non trouvé ou rôle invalide.");
			// Rediriger l'utilisateur 
			window.location.href = "../index.html";
		}
	} else {
		// Rediriger l'utilisateur
		window.location.href = "../index.html";
	}

	// récupérer l'id dans l'url
	const urlParams = new URLSearchParams(window.location.search);
	const offer_id = urlParams.get('id');

	// Récupérer les données de l'offre
	const offer_data = await loadData('../api/api.php?request=offer&method=get', { offre_id: offer_id });
	if (!offer_data || !Array.isArray(offer_data)) {
		console.log("Erreur lors de la récupération des données de l'offre.");
		return;
	}
	const offer = offer_data[0];

	// Afficher le nom de l'entreprise #title-page
	document.querySelector("#title-page").textContent = "Liste des candidatures pour : " + offer.job_title;
	document.querySelector("#offer-link").innerHTML = `<a href="offer.html?id=${offer_id}">Voir l'offre</a>`;

	// Récupérer les candidatures pour l'offre
	const applications = await loadData('../api/api.php?request=application&method=get', { offre_id: offer_id });
	if (!applications || !Array.isArray(applications)) {
		console.log("Erreur lors de la récupération des candidatures.");
		return;
	}

	// Collecter tous les user_id distincts pour éviter des requêtes redondantes
	const userIds = [...new Set(applications.map(app => app.user_id))];
	const users_data = await loadData('../api/api.php?request=user&method=get', { user_ids: userIds });

	if (!users_data || !Array.isArray(users_data)) {
		console.log("Erreur lors de la récupération des données des utilisateurs.");
		return;
	}

	// Créer une map des utilisateurs par ID
	const usersMap = {};
	users_data.forEach(user => {
		usersMap[user.user_id] = user;
	});

	// Compter le nombre de candidatures pour chaque statuts
	let waiting = 0, rejected = 0, accepted = 0, canceled = 0;

	applications.forEach(application => {
		switch (application.status) {
			case "waiting":
				waiting++;
				break;
			case "rejected":
				rejected++;
				break;
			case "accepted":
				accepted++;
				break;
			case "canceled":
				canceled++;
				break;
		}
	});

	// Afficher les candidatures
	const status_data = {
		accepted: { status: "accepted", title: "Acceptée", count: accepted },
		waiting: { status: "waiting", title: "En attente", count: waiting },
		rejected: { status: "rejected", title: "Rejetée", count: rejected },
		canceled: { status: "canceled", title: "Annulée", count: canceled }
	}
	// Pour chaque status
	for (const status in status_data) {
		const data = status_data[status];
		// Récupérer le div correspondant à l'état
		const statusDiv = document.getElementById(data.status);
		// Récupérer les sous-div
		const headSublistDiv = statusDiv.querySelector('.head-sublist');
		const bodySublistDiv = statusDiv.querySelector('.body-sublist');

		// Afficher le nombre de candidatures
		headSublistDiv.textContent = "Candidatures " + data.title + " : " + data.count;

		// Pour chaque candidature
		for (const application of applications) {
			// Si le status de la candidature correspond à l'état
			if (application.status == data.status) {
				const user_info = usersMap[application.user_id];
				// Si l'utilisateur existe
				if (user_info) {
					bodySublistDiv.innerHTML += `
						<div class="application-item">
							<div class="application-item-info">
								<div class="application-item-head">
									<h3>${user_info.first_name} ${user_info.last_name}</h3>
									<p>Mail : ${user_info.email}</p>
									<p>Tel : ${user_info.phone}</p>
								</div>
								<div class="application-item-body">
									<p>${application.message}</p>
								</div>
							</div>
							<div class="application-item-action">
								<button class="btn btn-primary" onclick="...">Voir</button>
								${application.status === "waiting" ? `
									<button class="btn btn-danger" onclick="handleApplication(${application.application_id}, '${offer.job_title}', 'rejected')">Rejetée</button>
									<button class="btn btn-success" onclick="handleApplication(${application.application_id}, '${offer.job_title}', 'accepted')">Acceptée</button>
								` : ''}
							</div>
						</div>
					`;
				}
			}
		}
	}
});