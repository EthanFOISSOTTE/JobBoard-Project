CREATE TABLE `users` (
  `user_id` SERIAL PRIMARY KEY,
  `last_name` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(15),
  `role` VARCHAR(50) DEFAULT 'applicant',
  `is_blocked` BOOLEAN DEFAULT false,
  `created_at` TIMESTAMP DEFAULT (current_timestamp)
);

CREATE TABLE `passwords` (
  `password_id` SERIAL PRIMARY KEY,
  `user_id` INT,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT (current_timestamp)
);

CREATE TABLE `companies` (
  `company_id` SERIAL PRIMARY KEY,
  `user_id` INT,
  `company_name` VARCHAR(255) NOT NULL,
  `company_description` TEXT,
  `company_website` VARCHAR(255),
  `is_blocked` BOOLEAN DEFAULT false
);

CREATE TABLE `offers` (
  `offre_id` SERIAL PRIMARY KEY,
  `company_id` INT,
  `job_title` VARCHAR(255) NOT NULL,
  `short_description` VARCHAR(500),
  `markdown_file` TEXT,
  `tags` varchar(255),
  `job_location` VARCHAR(255),
  `salary` DECIMAL(10,2),
  `work_time` VARCHAR(100),
  `is_blocked` BOOLEAN DEFAULT false,
  `created_at` TIMESTAMP DEFAULT (current_timestamp)
);

CREATE TABLE `applications` (
  `application_id` SERIAL PRIMARY KEY,
  `offre_id` INT,
  `user_id` INT,
  `message` TEXT,
  `status` VARCHAR(50) DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT (current_timestamp)
);

CREATE TABLE `notifications` (
  `notif_id` SERIAL PRIMARY KEY,
  `user_id` INT,
  `body` TEXT,
  `is_seen` BOOLEAN DEFAULT false,
  `is_archived` BOOLEAN DEFAULT false,
  `sent_at` TIMESTAMP DEFAULT (current_timestamp)
);

ALTER TABLE `passwords` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `companies` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `offers` ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`);

ALTER TABLE `applications` ADD FOREIGN KEY (`offre_id`) REFERENCES `offers` (`offre_id`);

ALTER TABLE `applications` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `notifications` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
