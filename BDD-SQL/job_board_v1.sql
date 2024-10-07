CREATE TABLE `User` (
  `user_id` int PRIMARY KEY AUTO_INCREMENT,
  `first_name` varchar(255),
  `last_name` varchar(255),
  `email` varchar(255),
  `password` varchar(255),
  `phone_number` varchar(20),
  `created_at` datetime DEFAULT (now())
);

CREATE TABLE `Company` (
  `company_id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `industry` varchar(255),
  `description` text,
  `website` varchar(255),
  `password` varchar(255),
  `created_at` datetime DEFAULT (now())
);

CREATE TABLE `JobOffer` (
  `job_offer_id` int PRIMARY KEY AUTO_INCREMENT,
  `title` varchar(255),
  `description` text,
  `location` varchar(255),
  `salary` decimal(10,2),
  `company_id` int,
  `created_at` datetime DEFAULT (now())
);

CREATE TABLE `JobApplication` (
  `job_application_id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  `job_offer_id` int,
  `status` varchar(50),
  `applied_at` datetime DEFAULT (now())
);

ALTER TABLE `JobOffer` ADD FOREIGN KEY (`company_id`) REFERENCES `Company` (`company_id`);

ALTER TABLE `JobApplication` ADD FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`);

ALTER TABLE `JobApplication` ADD FOREIGN KEY (`job_offer_id`) REFERENCES `JobOffer` (`job_offer_id`);
