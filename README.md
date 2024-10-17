# JobBoard

## Description

**JobBoard** est une plateforme web permettant la gestion et la publication d'annonces d'emploi, avec une interface intuitive pour les utilisateurs et un espace d'administration dédié aux gestionnaires. Ce projet combine une base de données, un frontend dynamique, et une API pour centraliser et faciliter le processus de recrutement.

## Fonctionnalités principales

- **Base de données relationnelle** : Nous avons structuré une base SQL pour gérer les offres d'emploi, les entreprises, et les candidatures. Cette structure permet une gestion efficace des annonces et des informations liées aux candidats.
  
- **Frontend interactif** : Une page web a été développée en HTML/CSS et JavaScript pour afficher les annonces d'emploi. Chaque annonce comprend un titre, une description succincte et un bouton permettant d'obtenir plus d'informations sans recharger la page.

- **API** : L'API permet de réaliser des opérations CRUD (Create, Read, Update, Delete) sur les annonces et les candidatures. Les informations des offres sont récupérées dynamiquement via l'API lorsque l'utilisateur clique sur "En savoir plus".

- **Système de candidature** : Chaque annonce propose un bouton "Postuler", qui ouvre un formulaire. Les utilisateurs peuvent y saisir leurs informations (nom, email, téléphone, etc.) et soumettre une candidature. Ces informations sont stockées dans la base de données.

- **Authentification des utilisateurs** : Un système de connexion permet aux utilisateurs de postuler sans ressaisir leurs informations. Les utilisateurs connectés accèdent à un espace personnel où ils peuvent gérer leurs candidatures.

- **Interface d'administration** : Une page dédiée permet aux administrateurs de gérer les annonces, les entreprises et les candidatures. Cette interface inclut des fonctionnalités de pagination pour gérer efficacement de grandes quantités de données.

- **Design soigné** : Un soin particulier a été apporté à l'interface utilisateur pour offrir une navigation fluide et agréable.

## Stack technique

- **Backend** : API avec PHP.
- **Frontend** : HTML/CSS, JavaScript pour une interface dynamique.
- **Base de données** : SQL avec MySQL.

## Contributeurs

Pol-Mattis HARQUET : https://github.com/Oriloo

Ethan FOISSOTTE : https://github.com/EthanFOISSOTTE
