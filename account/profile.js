document.addEventListener("DOMContentLoaded", async function() {
	// Déclarer la variable user
	let user = null;
	let company = null;

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
		const user_data = await loadData('../api/api.php?request=user&method=get');
		if (!user_data || !Array.isArray(user_data)) {
			console.log("Erreur lors de la récupération des données utilisateur.");
			return;
		}
		// Trouver l'utilisateur correspondant à l'ID stocké
		user = user_data.find(u => u.user_id == sessionStorage.getItem("user_id"));

		if (user) {
			// préremplir les champs des formulaires
			document.getElementById("formUser").firstname.value = user.first_name;
			document.getElementById("formUser").lastname.value = user.last_name;
			document.getElementById("formUser").email.value = user.email;
			document.getElementById("formUser").phone.value = user.phone;
			if (user.role == "admin") {
				// ajouter l'option Admin au select #role
				document.getElementById("formUser").role.innerHTML += '<option value="admin">Admin</option>';
			}
			document.getElementById("formUser").role.value = user.role;
		} else {
			console.log("Utilisateur non trouvé.");
		}
	} else {
		// Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
		window.location.href = "login.html";
	}

	// Fonction pour afficher ou non le formulaire de l'entreprise
	async function formularCompany() {
		const role = document.getElementById('role').value;
		if (role === 'companie') {
			// ajouter dans le formulaire dans le div #company-form
			document.getElementById('company-form').innerHTML = `
				<span>Entreprise</span>
				<input type="text" name="company-name" id="company-name" placeholder="Nom de l'entreprise" required>
				<input type="text" name="company-desc" id="company-desc" placeholder="Description de l'entreprise" required>
				<input type="text" name="company-site" id="company-site" placeholder="Site web de l'entreprise" required>
			`;
			const company_data = await loadData('../api/api.php?request=company&method=get');
			if (!company_data || !Array.isArray(company_data)) {
				console.log("Erreur lors de la récupération des données entreprise.");
				return;
			}
			// récupérer les données de l'entreprise de l'utilisateur
			company = company_data.find(c => c.user_id == user.user_id);
			if (company) {
				document.getElementById("company-name").value = company.company_name;
				document.getElementById("company-desc").value = company.company_description;
				document.getElementById("company-site").value = company.company_website;
			} else {
				console.log("Entreprise de la company non trouvée.");
			}
		} else {
			document.getElementById('company-form').innerHTML = '';
			company = null;
			console.log("Entreprise de la company supprimée.");
		}
	}

	formularCompany();
	document.getElementById('role').addEventListener('click', function() { formularCompany(); });

	// Fonction pour mettre à jour les données utilisateur
	document.getElementById("formUser").addEventListener("submit", async function(event) {
		event.preventDefault();
		const formData = new FormData(this);
		// vérifier si l'email ou le phone existe déjà
		const user_data = await loadData('../api/api.php?request=user&method=get');
		if (!user_data || !Array.isArray(user_data)) {
			console.log("Erreur lors de la récupération des données utilisateur.");
			return;
		}
		const user_email = user_data.find(u => u.email == formData.get("email"));
		const user_phone = user_data.find(u => u.phone == formData.get("phone"));
		if (user_email && user_email.user_id != user.user_id || user_phone && user_phone.user_id != user.user_id) {
			return alert("L'email ou le numéro de téléphone existe déjà.");
		}

		const postData = {
			last_name: formData.get("lastname"),
			first_name: formData.get("firstname"),
			email: formData.get("email"),
			phone: formData.get("phone"),
			role: formData.get("role"),
			is_blocked: user.is_blocked,
			user_id: user.user_id,
		};
		// Modifier les données de l'utilisateur
		const response = await loadData('../api/api.php?request=user&method=put', postData);
		if (response && response.message) {
			if (company) {
				const companyData = {
					company_name: formData.get("company-name"),
					company_description: formData.get("company-desc"),
					company_website: formData.get("company-site"),
					is_blocked: company.is_blocked,
					company_id: company.company_id,
				};
				// Modifier les données de l'entreprise
				const responseCompany = await loadData('../api/api.php?request=company&method=put', companyData);
				if (responseCompany && responseCompany.message) {
					console.log("Données de l'entreprise mises à jour.");
				} else {
					console.log("Erreur lors de la mise à jour des données de l'entreprise.");
				}
			}

			// Rediriger vers la page de profil
			window.location.href = "profile.html";
		} else {
			console.log("Erreur lors de la mise à jour des données utilisateur.");
		}
	});

	// Fonction pour mettre à jour le mot de passe utilisateur
	document.getElementById("formPass").addEventListener("submit", async function(event) {
		event.preventDefault();
		const formData = new FormData(this);
		if (formData.get("password-1") != formData.get("password-2")) {
			return alert("Les mots de passe ne correspondent pas.");
		}
		const postData = {
			password: formData.get("password-1"),
			user_id: user.user_id,
		};
		console.log(postData);
		// Modifier le mot de passe de l'utilisateur
		const response = await loadData('../api/api.php?request=password&method=put', postData);
		if (response && response.message) {
			// Rediriger vers la page de profil
			window.location.href = "profile.html";
		} else {
			console.log("Erreur lors de la mise à jour du mot de passe.");
		}
	});

	document.getElementById("formSuppr").addEventListener("submit", async function(event) {
		event.preventDefault();
		if (confirm("Voulez-vous vraiment supprimer votre compte ?")) {
			// Supprimer le compte utilisateur
			const response = await loadData('../api/api.php?request=user&method=delete', { user_id: user.user_id });
			if (response && response.message) {
				// suprimer le mot de passe
				const response2 = await loadData('../api/api.php?request=password&method=delete', { user_id: user.user_id });
				if (!response2 || !response2.message) {
					console.log("Erreur lors de la suppression du mot de passe utilisateur.");
					return;
				}
				if (company) {
					// supprimer l'entreprise
					const response3 = await loadData('../api/api.php?request=company&method=delete', { company_id: company.company_id });
					if (!response3 || !response3.message) {
						console.log("Erreur lors de la suppression de l'entreprise.");
						return;
					}

					// Récupérer les annonces de l'entreprise
					const job_data = await loadData('../api/api.php?request=offer&method=get');
					if (!job_data || !Array.isArray(job_data)) {
					    console.log("Erreur lors de la récupération des annonces.");
					    return;
					}
					// Récupérer les ID des annonces de l'entreprise
					let job_ids = job_data
					    .filter(j => j.company_id == company.company_id)
					    .map(j => { return j.offre_id; });
					console.log("Les ID des offres (les suppr) :", job_ids);
					// Supprimer les annonces de l'entreprise
					for (let job_id of job_ids) {
						const response = await loadData('../api/api.php?request=offer&method=delete', { offre_id: job_id });
						if (!response || !response.message) {
							console.log("Erreur lors de la suppression de l'annonce.");
						}
					}

					// Récupérer les candidatures des annonces de l'entreprise
					const apply_all_data = await loadData('../api/api.php?request=application&method=get');
					if (!apply_all_data || !Array.isArray(apply_all_data)) {
						console.log("Erreur lors de la récupération des candidatures.");
						return;
					}
					// Récupérer les data des candidatures des annonces de l'entreprise
					let apply_data = apply_all_data
						.filter(a => job_ids.includes(a.offre_id));
					console.log("Les data des candidatures (les cancel) :", apply_data);
					// Modifier le status des candidatures des annonces de l'entreprise
					for (let apply of apply_data) {
						const postData = {
							offre_id: apply.offre_id,
							user_id: apply.user_id,
							message: apply.message,
							status: 'canceled',
							application_id: apply.application_id,
						};
						const response = await loadData('../api/api.php?request=application&method=put', postData);
						if (!response || !response.message) {
							console.log("Erreur lors de la modification du status de la candidature.");
						}
					}

					// Récupérer les ID des utilisateurs des candidatures des annonces
					let apply_ids = apply_data.map(a => a.application_id);
					let user_ids = apply_data
						.filter(a => apply_ids.includes(a.application_id))
						.map(a => { return a.user_id; });
					console.log("Les ID des utilisateurs (les notif) :", user_ids);
					// Envoyer une notification aux utilisateurs des candidatures des annonces
					for (let user_id of user_ids) {
						const postData = {
							user_id: user_id,
							body: 'L\'entreprise chez la quel vous avez postuler à été supprimée, votre candidature a été annulée.',
							is_seen: 0,
							is_archived: 0,
						};
						console.log("Envoi de notification à l'utilisateur avec l'ID :", user_id);
						const response = await loadData('../api/api.php?request=notification&method=post', postData);
						console.log("Réponse après l'envoi de notification : ", response);
						if (!response || !response.message) {
							console.log("Erreur lors de l'envoi de la notification.");
						}
					}
				}
				// supprimer la session
				sessionStorage.removeItem("user_id");
				// Rediriger vers la page de connexion
				window.location.href = "login.html";
			} else {
				console.log("Erreur lors de la suppression du compte utilisateur.");
			}
		}
	});
});
