#!/bin/bash

# Créer le dossier de téléchargement s'il n'existe pas
mkdir -p backend/uploads

# Installer les dépendances du backend
echo "Installation des dépendances du backend..."
cd backend
npm install

# Installer les dépendances du frontend
echo "Installation des dépendances du frontend..."
cd ../frontend
npm install

# Démarrer les serveurs
echo "Démarrage des serveurs..."
cd ../backend
npm run dev &
cd ../frontend
npm start 