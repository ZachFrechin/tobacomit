-- Migration: Create users table
-- Description: Crée la table users pour stocker les informations des utilisateurs

-- Supprimer la table si elle existe déjà
DROP TABLE IF EXISTS users;

-- Créer la table users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Pseudo de l\'utilisateur',
    password VARCHAR(255) NOT NULL COMMENT 'Mot de passe hashé (bcrypt)',
    email VARCHAR(255) NULL COMMENT 'Email de l\'utilisateur (optionnel)',
    date DATE NULL COMMENT 'Date de la dernière création de crash',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Date de mise à jour',
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Table des utilisateurs';

