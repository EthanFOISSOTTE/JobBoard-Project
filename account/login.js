document.addEventListener("DOMContentLoaded", function() {
	// Fonction pour afficher un message d'erreur si 'error=1' est présent dans l'URL
	function checkForError() {
		const urlParams = new URLSearchParams(window.location.search);
		const errorParam = urlParams.get('error');
		if (errorParam === '1') {
			document.getElementById("error").textContent = "Veuillez vérifier votre email et mot de passe.";
		}
	}

	// Vérifier et afficher l'erreur
	checkForError();

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

	// Fonction pour désactiver le formulaire de connexion
	function disableForm() {
		document.getElementById("email").disabled = true;
		document.getElementById("password").disabled = true;
		document.getElementById("submitBtn").disabled = true;
	}

	// Attendre le submit du formulaire
	document.getElementById("loginForm").addEventListener("submit", async function(event) {
		disableForm(); // Désactiver le formulaire
		event.preventDefault();
		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;

		// Vérification des paramètres d'entrée
		if (!email || !password) {
			console.log("Veuillez remplir tous les champs.");
			return;
		}

		try {
			// Attendre la récupération des données utilisateur
			const user_data = await loadData('../api/api.php?request=user&method=get');
			if (!user_data || !Array.isArray(user_data)) {
				console.log("Erreur lors de la récupération des données utilisateur.");
				return;
			}
			const user = user_data.find(user => user.email === email);
			if (!user) {
				console.log("Connexion échouée.");
				// Attente de 2 secondes avant de rediriger vers la page de login
				setTimeout(() => {
					window.location.href = "../account/login.html?error=1";
				}, 2000);
				return;
			}
			const user_id = user.user_id;
			const role = user.role;
			const first_name = user.first_name;

			// Vérifier si le mot de passe est correct
			const postData = { user_id: user_id };
			const password_data = await loadData('../api/api.php?request=password&method=get', postData);
			if (!password_data || !Array.isArray(password_data)) {
				console.log("Erreur lors de la récupération des données de mot de passe.");
				return;
			}
			const password_info = password_data.find(password => password.user_id === user_id);
			if (!password_info) {
				console.log("Mot de passe non trouvé pour cet utilisateur.");
				return;
			}
			const password_hash = password_info.password_hash;

			// Vérifier si le mot de passe est correct
			bcrypt.compare(password, password_hash, function(err, result) {
				if (err) {
					console.log("Erreur lors de la vérification du mot de passe.");
					return;
				}
				if (result) {
					console.log("Connexion réussie.");
					// Ouvrir une session pour l'utilisateur
					sessionStorage.setItem("user_id", user_id);
					sessionStorage.setItem("role", role);
					sessionStorage.setItem("first_name", first_name);
					window.location.href = "../page/home.html";
				} else {
					console.log("Connexion échouée.");
					// Attente de 2 secondes avant de rediriger vers la page de login
					setTimeout(() => {
						window.location.href = "../account/login.html?error=1";
					}, 2000);
				}
			});
		} catch (error) {
			console.log("Une erreur s'est produite :", error);
		}
	});
});
