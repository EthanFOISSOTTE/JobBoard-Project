//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║Titre : dashboard.js                                               ║
//  ║Description : Permet la modération des candidatures et des offres  ║
//  ║              d'une entreprise par son responsable                 ║
//  ║Auteur : FOISSOTTE Ethan / HARQUET Pol-Mattis                      ║
//  ║Date : 17/10/2024 (modification)                                   ║
//  ║Version : 2.1 (Ajout de commentaires)                              ║
//  ╚═══════════════════════════════════════════════════════════════════╝

// INDEX : DONNEES DES OFFRES POSTER PAR L'ENTREPRISE [15 - 36]
//         PERMET LA GESTION D'UNE OFFRE, ET NOTIFICATION DE SUPPRESSION [37 - 104]
//         AFFICHAGE DES OFFRES POSTER PAR L'ENTREPRISE + CANDIDATURE [105 - 220]


//  ╔═══════════════════════════════════════════════════════════════════╗
//  ║      		 DONNEES DES OFFRES POSTER PAR L'ENTREPRISE   	        ║
//  ╚═══════════════════════════════════════════════════════════════════╝

// Inisialisation des variobles global
let offer;
let companyID;

document.addEventListener("DOMContentLoaded", async function() {
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
			// L'utilisateur est une entreprise
			console.log("Utilisateur connecté :", user.email);

			// Récupéré l'id de l'entreprise
			const companyData = await loadData('../api/api.php?request=company&method=get', { user_id: user.user_id });
			if (!companyData || companyData.length === 0) {
				console.error("Error: No data found");
				return;
			}
			companyID = companyData[0].company_id;
		} else {
			// console.log("Utilisateur non trouvé ou rôle invalide.");
			// Rediriger l'utilisateur
			window.location.href = "../index.html";
		}
	} else {
		// console.log("Utilisateur non connecté.");
		// Rediriger l'utilisateur
		window.location.href = "../index.html";
	}

	// Vérifieier si c'est une modification ou une cration
	const editor = new URLSearchParams(window.location.search).get('editor');
	if (editor == "modify") {
		// Afficher le bouton de pour valider la modification
		document.getElementById('modify-btn').style.display = "block";

		// Récupération des données de l'offre
		const offerId = new URLSearchParams(window.location.search).get('id');
		const offerData = await loadData('../api/api.php?request=offer&method=get', { offre_id: offerId });
		if (!offerData || offerData.length === 0) {
			console.error("Error: No data found");
			return;
		}

		offer = offerData[0];
		// Affichage du titre de l'offre
		const offerTitle = document.getElementById('offer-title');
		offerTitle.value = offer.job_title;
		// Affichage de la description de l'offre
		const offerDescription = document.getElementById('offer-description');
		offerDescription.value = offer.short_description;
		// Affichage des tags
		const tagList = document.getElementById('tag-list');
		tagList.value = offer.tags;
		// Affichage du salaire
		const salary = document.getElementById('salary');
		salary.value = offer.salary;
		// Affichage du lieu de travail
		const jobLocation = document.getElementById('job-location');
		jobLocation.value = offer.job_location;
		// Affichage du temps de travail
		const workTime = document.getElementById('work-time');
		workTime.value = offer.work_time;
		// Affichage de la date de création
		const createdAt = document.getElementById('created-at');
		const date = new Date(offer.created_at);
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
		createdAt.innerHTML = date.toLocaleDateString('fr-FR', options);
		// Affichage du fichier markdown
		const markdownFile = document.getElementById('markdown-file');
		markdownFile.value = offer.markdown_file;
	} else {
		// Afficher le bouton de pour valider la création
		document.getElementById('create-btn').style.display = "block";
		// Cacher le div de la date
		document.getElementById('div-date').style.display = "none";
		// Mise à jour du titre de la page
		document.getElementById('title-page').innerHTML = "Céation d'offre";
		document.title = "Céation de l'offre de l'Entreprise";
		// Laisser les champ vide pour la cration
	}

	/*************************************************************************************/
	/*************************************************************************************/
	/*************************************************************************************/

	// Fonction pour récupérer les données du formulaire
	async function retrieveData() {
		// Récupération des données du formulaire
		const offerTitle = document.getElementById('offer-title').value;
		const offerDescription = document.getElementById('offer-description').value;
		const markdownFile = document.getElementById('markdown-file').value;
		const tagList = document.getElementById('tag-list').value;
		const jobLocation = document.getElementById('job-location').value;
		const salary = document.getElementById('salary').value;
		const workTime = document.getElementById('work-time').value;

		// Formater les données
		const postData = {
        	job_title: offerTitle,
        	short_description: offerDescription,
        	markdown_file: markdownFile,
        	tags: tagList,
        	job_location: jobLocation,
        	salary: salary,
        	work_time: workTime,
		};

		return postData;
	}

	// Annulation du formulaire
	document.getElementById('cancel-btn').addEventListener('click', function() {
		// console.log('Le formulaire à été annulé');
		window.location.href = 'dashboard.html';
	});

	// Création de l'offre
	document.getElementById('create-btn').addEventListener('click', async function() {
		event.preventDefault(); // Empêcher la soumission par défaut du formulaire
		let postData = await retrieveData();

		// Ajout de is_blocked et company_id à postData
		postData.is_blocked = 0;
		postData.company_id = companyID;

		// Envoi des données à l'API
		const response = await loadData('../api/api.php?request=offer&method=post', postData);
		if (response && response.message === "Offer created successfully.") {
			// alert("L'offre a bien été créée !");
			window.location.href = 'dashboard.html';
		} else {
			alert("Une erreur est survenue lors de la création de l'offre.");
		}
	});

	// Modification de l'offre
	document.getElementById('modify-btn').addEventListener('click', async function() {
		event.preventDefault(); // Empêcher la soumission par défaut du formulaire
		let postData = await retrieveData();

		// Ajout de is_blocked et offre_id à postData
		postData.is_blocked = offer.is_blocked;
		postData.offre_id = offer.offre_id;

		// Envoi des données à l'API
		const response = await loadData('../api/api.php?request=offer&method=put', postData);
		if (response && response.message === "Offer updated successfully.") {
			// alert("L'offre a bien été modifiée !");
			window.location.href = 'dashboard.html';
		} else {
			alert("Une erreur est survenue lors de la modification de l'offre.");
		}
	});
});
