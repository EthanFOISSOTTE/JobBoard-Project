-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 07 oct. 2024 à 09:30
-- Version du serveur : 8.3.0
-- Version de PHP : 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `job_board`
--

-- --------------------------------------------------------

--
-- Structure de la table `company`
--

DROP TABLE IF EXISTS `company`;
CREATE TABLE IF NOT EXISTS `company` (
  `company_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `industry` varchar(255) DEFAULT NULL,
  `description` text,
  `website` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`company_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `company`
--

INSERT INTO `company` (`company_id`, `name`, `industry`, `description`, `website`, `created_at`, `password`) VALUES
(1, 'Tech Innovators Inc.', 'Technologie', 'Une entreprise de développement de logiciels spécialisée dans les solutions innovantes pour les entreprises.', 'https://www.techinnovators.com', '2024-10-07 11:26:55', 'password1234');

-- --------------------------------------------------------

--
-- Structure de la table `jobapplication`
--

DROP TABLE IF EXISTS `jobapplication`;
CREATE TABLE IF NOT EXISTS `jobapplication` (
  `job_application_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `job_offer_id` int DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `applied_at` datetime DEFAULT (now()),
  PRIMARY KEY (`job_application_id`),
  KEY `user_id` (`user_id`),
  KEY `job_offer_id` (`job_offer_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `joboffer`
--

DROP TABLE IF EXISTS `joboffer`;
CREATE TABLE IF NOT EXISTS `joboffer` (
  `job_offer_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`job_offer_id`),
  KEY `company_id` (`company_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `joboffer`
--

INSERT INTO `joboffer` (`job_offer_id`, `title`, `description`, `location`, `salary`, `company_id`, `created_at`) VALUES
(1, 'Développeur Full Stack', 'Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe.', 'Paris, France', 55000.00, 1, '2024-10-07 11:21:35');

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`user_id`, `first_name`, `last_name`, `email`, `password`, `phone_number`, `created_at`) VALUES
(1, 'Jean', 'Dupont', 'jean.dupont@example.com', 'password123', '+33123456789', '2024-10-07 11:28:16');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
