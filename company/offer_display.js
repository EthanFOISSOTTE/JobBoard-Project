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
		} else {
			console.log("Utilisateur non trouvé ou rôle invalide.");
			// Rediriger l'utilisateur
			window.location.href = "../index.html";
		}
	} else {
		// Rediriger l'utilisateur
		window.location.href = "../index.html";
	}

	// Récupération des données de l'offre
	const offerId = new URLSearchParams(window.location.search).get('id');
	const offerData = await loadData('../api/api.php?request=offer&method=get', { offre_id: offerId });
	if (!offerData || offerData.length === 0) {
		console.error("Error: No data found");
		return;
	}
	const offer = offerData[0];

	// Récupération des données de l'entreprise
	const companyData = await loadData('../api/api.php?request=company&method=get', { company_id: offer.company_id });
	if (!companyData || companyData.length === 0) {
		console.error("Error: No data found");
		return;
	}
	const company = companyData[0];

	// Affichage des données de l'offre
	const offerTitle = document.getElementById('offer-title');
	const offerDescription = document.getElementById('offer-description');
	offerTitle.innerHTML = offer.job_title;
	offerDescription.innerHTML = offer.short_description;

	// Affichage des données de l'entreprise
	const companyTitle = document.getElementById('company-title');
	const companyDescription = document.getElementById('company-description');
	companyTitle.innerHTML = company.company_name;
	companyDescription.innerHTML = company.company_description;

	// Affichage du fichier markdown
	const markdownFile = document.getElementById('markdown-file');
	const htmlContent = marked.parse(offer.markdown_file);
	markdownFile.innerHTML = htmlContent;

	// Affichage des tags
	const tags = offer.tags.split(',');
	const tagList = document.getElementById('tag-list');
	tagList.innerHTML = ''; // Effacer le contenu précédent
	tags.forEach((tag, index) => {
		// Créer l'élément <a> pour le tag
		const tagLink = document.createElement('a');
		tagLink.href = "#";
		tagLink.classList.add('tag-link');
		tagLink.innerText = tag.trim();

		// Ajouter l'élément <a> au <div> tag-list
		tagList.appendChild(tagLink);

		// Ajouter une virgule après chaque tag sauf le dernier
		if (index < tags.length - 1) {
			const comma = document.createElement('span');
			comma.innerText = ', ';
			tagList.appendChild(comma);
		}
	});

	// Affichage du salaire
	const salary = document.getElementById('salary');
	salary.innerHTML = offer.salary;

	// Affichage du lieu de travail
	const jobLocation = document.getElementById('job-location');
	jobLocation.innerHTML = offer.job_location;
	const jobLocation2 = document.getElementById('job-location2');
	jobLocation2.innerHTML = offer.job_location;

	// Affichage du temps de travail
	const workTime = document.getElementById('work-time');
	workTime.innerHTML = offer.work_time;

	// Affichage de la date de création (aaficher la date sous cette forme : 6 septembre 2024) dans #created-at
	const createdAt = document.getElementById('created-at');
	const date = new Date(offer.created_at);
	const options = { year: 'numeric', month: 'long', day: 'numeric' };
	createdAt.innerHTML = date.toLocaleDateString('fr-FR', options);

	// Affichage du lien vers le site de l'entreprise
	const companyWebsite = document.getElementById('company-website');
	companyWebsite.href = company.company_website;
});
