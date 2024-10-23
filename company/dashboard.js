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

// Fonction pour modifier une offre
function editOffer(id) {
	// Rediriger l'utilisateur vers la page de modification de l'offre
	window.location.href = `offer_editor.html?editor=modify&id=${id}`;
}

// Fonction pour supprimer une offre
async function deleteOffer(id) {
	if (confirm("Voulez-vous vraiment supprimer cette offre ?")) {
		// Récupérer les données de l'offre
		const offer = await loadData('../api/api.php?request=offer&method=get', { offre_id: id });
		if (!offer) {
			console.log("Erreur lors de la récupération des données de l'offre.");
			return;
		}

		// Supression de l'offre
		const response1 = await loadData("../api/api.php?request=offer&method=delete", { offre_id: id });
		if (!response1 || !response1.message) {
			console.log("Erreur lors de la suppression de l'offre.");
			return;
		}

		// Récupéré toutes les candidatures en attente liées à cette offre
		const applications = await loadData('../api/api.php?request=application&method=get', { offre_id: id });
		if (!applications) {
			console.log("Erreur lors de la récupération des candidatures.");
			return;
		}

		// Pour chaque candidature en attente, annuler la candidature
		for (let i = 0; i < applications.length; i++) {
			if (applications[i].status == "waiting") {
				// Annuler la candidature
				const postData1 = {
					offre_id: applications[i].offre_id,
					user_id: applications[i].user_id,
					message: applications[i].message,
					status: 'canceled',
					application_id: applications[i].application_id,
				};
				const response2 = await loadData("../api/api.php?request=application&method=put", postData1);
				if (!response2 || !response2.message) {
					console.log("Erreur lors de l'annulation de la candidature.");
					return;
				}

				// Envoyer une notification à l'utilisateur
				const postData2 = {
					user_id: applications[i].user_id,
					body: `L'offre \"${offer[0].job_title}\" à la quel vous avez postuler à été supprimée, votre candidature a donc été annulée.`,
					is_seen: 0,
					is_archived: 0,
				}
				const response3 = await loadData("../api/api.php?request=notification&method=post", postData2);
				if (!response3 || !response3.message) {
					console.log("Erreur lors de l'envoi de la notification.");
					return;
				}
			}
		}
	}
}

document.addEventListener("DOMContentLoaded", async function() {
	// Déclarer la variable user
	let user = null;
	let company = null;

	if (sessionStorage.getItem("user_id")) {
		// Récupération des données utilisateur
		const user_data = await loadData("../api/api.php?request=user&method=get");
		if (!user_data || !Array.isArray(user_data)) {
			console.log("Erreur lors de la récupération des données utilisateur.");
			return;
		}
		// Trouver l'utilisateur correspondant à l'ID stocké
		user = user_data.find(u => u.user_id == sessionStorage.getItem("user_id"));

		if (user.role == "compagnie") {
			// Récupération des données de la compagn
			const company_data = await loadData('../api/api.php?request=company&method=get');
			if (!company_data || !Array.isArray(company_data)) {
				console.log("Erreur lors de la récupération des données entreprise.");
				return;
			}
			// récupérer les données de l'entreprise de l'utilisateur
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

	// Afficher le nom de l'entreprise #title-page
	document.querySelector("#title-page").textContent = "Tableau de Bord : " + company.company_name;

	// Afficher la liste des offres de l'entreprise dans #offers-list
	const offersList = document.querySelector("#offers-list");

	// Récupérer les offres de l'entreprise
	const companyOffers = await loadData('../api/api.php?request=offer&method=get', { company_id: company.company_id });
	if (!companyOffers || !Array.isArray(companyOffers)) {
		console.log("Erreur lors de la récupération des offres de l'entreprise.");
		return;
	}

	// Afficher les offres de l'entreprise
	companyOffers.forEach(offer => {
		const offerItem = document.createElement("li");
		offerItem.innerHTML = `
			<div class="offer-item">
				<div class="offer-info">
					<a href="offer_display.html?id=${offer.offre_id}">${offer.job_title}</a>
					<p>${offer.short_description}</p>
					<button class="btn btn-primary" onclick="editOffer(${offer.offre_id})">Modifier</button>
					<button class="btn btn-danger" onclick="deleteOffer(${offer.offre_id})">Supprimer</button>
				</div>

				<div class="offer-candidature">
					<h3>Candidatures</h3>
					<ul id="applications-list-${offer.offre_id}">
						<li>Chargement des candidatures...</li>
					</ul>
				</div>
			</div>
		`;
		offersList.appendChild(offerItem);
	});

	// Afficher les candidatures pour chaque offre
	companyOffers.forEach(async offer => {
		// Récupérer les candidatures pour l'offre
		const applications = await loadData('../api/api.php?request=application&method=get', { offre_id: offer.offre_id });
		if (!applications || !Array.isArray(applications)) {
			console.log("Erreur lors de la récupération des candidatures.");
			return;
		}

		// Afficher les candidatures
		const applicationsList = document.querySelector(`#applications-list-${offer.offre_id}`);

		// Conter le nombre de candidatures, status = ['waiting', 'rejected', 'accepted', 'canceled']
		let waiting = 0;
		let rejected = 0;
		let accepted = 0;
		let canceled = 0;

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

		// Afficher le nombre de candidatures
		applicationsList.innerHTML = `
			<li><a href="application.html?id=${offer.offre_id}#waiting">En attente: ${waiting}</a></li>
			<li><a href="application.html?id=${offer.offre_id}#rejected">Rejetées: ${rejected}</a></li>
			<li><a href="application.html?id=${offer.offre_id}#accepted">Acceptées: ${accepted}</a></li>
			<li><a href="application.html?id=${offer.offre_id}#canceled">Annulées: ${canceled}</a></li>
		`;
	});
});
