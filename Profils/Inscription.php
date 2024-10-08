<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscription</title>
    <link rel="stylesheet" href="index.css">
</head>
<body>
    <h1>Inscription</h1>
    <div class="signup-container">
        <form id="signupForm">
            <label for="first_name">Prénom:</label>
            <input type="text" id="first_name" name="first_name" required>
            
            <label for="last_name">Nom:</label>
            <input type="text" id="last_name" name="last_name" required>

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
            
            <label for="phone">Téléphone:</label>
            <input type="tel" id="phone" name="phone">
            
            <label for="password">Mot de passe:</label>
            <input type="password" id="password" name="password" required>
            
            <button type="button" id="signupButton">S'inscrire</button>
        </form>

        <div id="responseMessage"></div>
    </div>

    <script>
        document.getElementById('signupButton').addEventListener('click', function() {
            const firstName = document.getElementById('first_name').value;
            const lastName = document.getElementById('last_name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;

            const data = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
                password: password
            };

            // Envoyer les données à l'API via POST
            fetch('api/API.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('responseMessage').textContent = 'Inscription réussie !';
                    document.getElementById('signupForm').reset();
                } else {
                    document.getElementById('responseMessage').textContent = data.message || 'Erreur lors de l\'inscription.';
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                document.getElementById('responseMessage').textContent = 'Erreur lors de l\'inscription.';
            });
        });
    </script>
</body>
</html>
