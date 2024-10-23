document.addEventListener("DOMContentLoaded", function() {
	// Fonction pour récupérer les données de l'API
	async function loadData(apiUrl, postData = null) {
		// console.log('Récupération des données...');
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

	async function createCompany(user_id) {
		const companyName = document.getElementById('company-name').value;
		const companyDesc = document.getElementById('company-desc').value;
		const companySite = document.getElementById('company-site').value;
		if (!companyName || !companyDesc || !companySite) {
			console.log('Veuillez remplir tous les champs de l\'entreprise.');
			disableForm(false); // Réactiver le formulaire
			return;
		}

		const postData = {
			user_id: user_id,
			company_name: companyName,
			company_description: companyDesc,
			company_website: companySite,
			is_blocked: 0,
		};

		// console.log('Création de l\'entreprise...');
		const apiUrl = '../api/api.php?request=company&method=post';
		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(postData)
			});
			const data = await response.json();
			if (response.ok) {
				// console.log("Company created successfully:", data);
				// Rediriger l'utilisateur vers la page de connexion
				window.location.href = 'login.html';
			} else {
				console.error("Failed to create company:", data.message);
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}

	async function createPassword(user_id, password, postCompany) {
		// console.log('Création du mot de passe...');
		const apiUrl = '../api/api.php?request=password&method=post';
		const postData = {
			user_id: user_id,
			password: password
		};
		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(postData)
			});
			const data = await response.json();
			if (response.ok) {
				// console.log("Password created successfully:", data);
				if (postCompany) {
					console.log('Utilisateur créés avec succès, go pour la création de l\'entreprise.');
					// Créer l'entreprise
					createCompany(user_id);
				} else {
					// Rediriger l'utilisateur vers la page de connexion
					console.log('Utilisateur créé avec succès.');
					window.location.href = 'login.html';
				}
			} else {
				console.error("Failed to create password:", data.message);
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}

	// Fonction pour créer un utilisateur
	async function createUser(postData, password, postCompany) {
		// console.log('Création de l\'utilisateur...');
		const apiUrl = '../api/api.php?request=user&method=post';
		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(postData)
			});
			const data = await response.json();
			if (response.ok) {
				// console.log("User created successfully:", data);
				// récupérer l'id de l'utilisateur et créer le mot de passe
				const user_data = await loadData('../api/api.php?request=user&method=get');
				const user = user_data.find(user => user.email === postData.email);
				const user_id = user.user_id;
				createPassword(user_id, password, postCompany);
			} else {
				console.error("Failed to create user:", data.message);
			}
		} catch (error) {
			console.error("Error:", error);
		}
	}

	// Fonction pour désactiver le formulaire d'inscription
	function disableForm(value = true) {
		document.getElementById('lastname').disabled = value;
		document.getElementById('firstname').disabled = value;
		document.getElementById('email').disabled = value;
		document.getElementById('tel').disabled = value;
		document.getElementById('role').disabled = value;
		document.getElementById('password-1').disabled = value;
		document.getElementById('password-2').disabled = value;
		document.getElementById('submitBtn').disabled = value;
	}

	// Fonction pour afficher ou non le formulaire de l'entreprise
	function formularCompany() {
		const role = document.getElementById('role').value;
		if (role === 'companie') {
			// ajouter dans le formulaire dans le div #company-form
			document.getElementById('company-form').innerHTML = `
				<input type="text" name="company-name" id="company-name" placeholder="Nom de l'entreprise" required>
				<input type="text" name="company-desc" id="company-desc" placeholder="Description de l'entreprise" required>
				<input type="text" name="company-site" id="company-site" placeholder="Site web de l'entreprise" required>
			`;
		} else {
			document.getElementById('company-form').innerHTML = '';
		}
	}

	formularCompany();
	document.getElementById('role').addEventListener('click', function() { formularCompany(); });

	document.getElementById('signinForm').addEventListener('submit', async function(event) {
		// console.log('Formulaire soumis.');
		disableForm(); // Désactiver le formulaire
		event.preventDefault();
		const lastname = document.getElementById('lastname').value;
		const firstname = document.getElementById('firstname').value;
		const email = document.getElementById('email').value;
		const tel = document.getElementById('tel').value;
		const role = document.getElementById('role').value;
		const password1 = document.getElementById('password-1').value;
		const password2 = document.getElementById('password-2').value;

		if (!lastname || !firstname || !email || !tel || !role || !password1 || !password2) {
			console.log('Veuillez remplir tous les champs.');
			disableForm(false); // Réactiver le formulaire
			return;
		}

		if (password1 !== password2) {
			console.log('Les mots de passe ne correspondent pas.');
			disableForm(false); // Réactiver le formulaire
			return;
		}

		// vérifier si l'email et le tel est déjà utilisé
		const user_data = await loadData('../api/api.php?request=user&method=get');
		if (!user_data || !Array.isArray(user_data)) {
			console.log("Erreur lors de la récupération des données utilisateur.");
			return;
		}
		const user_tel = user_data.find(user => user.tel === tel);
		const user_email = user_data.find(user => user.email === email);
		if (user_tel || user_email) {
			console.log('Cet utilisateur existe déjà.');
			disableForm(false); // Réactiver le formulaire
			return;
		}

		// Envoi des données à l'API
		const postData = {
			last_name: lastname,
			first_name: firstname,
			email: email,
			phone: tel,
			role: role,
			is_blocked: 0,
		};

		// Vérifier si l'utilisateur est une entreprise
		const postCompany = (role == 'companie');

		createUser(postData, password1, postCompany);
	});
});
