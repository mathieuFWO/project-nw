# Project NW - Plateforme de Réservation de Terrains

Une plateforme web permettant aux associations de gérer leurs terrains et événements, et aux joueurs de s'inscrire à ces événements.

## Fonctionnalités

- **Gestion des associations**
  - Inscription et authentification
  - Gestion des terrains (création, modification, suppression)
  - Gestion des événements (création, modification, annulation)

- **Gestion des joueurs**
  - Inscription et authentification
  - Consultation des événements
  - Inscription aux événements
  - Gestion des inscriptions

- **Système de paiement**
  - Intégration Stripe
  - Paiement sécurisé
  - Gestion des remboursements

## Prérequis

- Node.js (v14 ou supérieur)
- MySQL
- Compte Stripe (pour les paiements)

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/votre-username/project-nw.git
cd project-nw
```

2. Installer les dépendances :
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Configurer les variables d'environnement :
- Copier `.env.example` en `.env` dans les dossiers `backend` et `frontend`
- Remplir les variables d'environnement avec vos informations

4. Initialiser la base de données :
```bash
cd backend
npm run migrate
```

5. Démarrer les serveurs :
```bash
# Backend
cd backend
npm run dev

# Frontend (dans un autre terminal)
cd frontend
npm start
```

## Structure du Projet

```
project-nw/
├── backend/              # API Node.js
│   ├── src/
│   │   ├── controllers/ # Contrôleurs
│   │   ├── models/      # Modèles
│   │   ├── routes/      # Routes
│   │   └── app.js       # Application principale
│   └── package.json
│
├── frontend/             # Application React
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── pages/       # Pages
│   │   ├── contexts/    # Contextes React
│   │   └── App.js       # Application principale
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Terrains
- `GET /api/terrains` - Liste des terrains
- `POST /api/terrains` - Créer un terrain
- `PUT /api/terrains/:id` - Modifier un terrain
- `DELETE /api/terrains/:id` - Supprimer un terrain

### Événements
- `GET /api/events` - Liste des événements
- `POST /api/events` - Créer un événement
- `PUT /api/events/:id` - Modifier un événement
- `POST /api/events/:id/cancel` - Annuler un événement

### Inscriptions
- `POST /api/registrations` - S'inscrire à un événement
- `POST /api/registrations/:id/cancel` - Annuler une inscription
- `GET /api/registrations/joueur` - Liste des inscriptions d'un joueur
- `GET /api/registrations/event/:eventId` - Liste des inscriptions à un événement

### Paiements
- `POST /api/payments/create-checkout-session` - Créer une session de paiement
- `POST /api/payments/webhook` - Webhook Stripe
- `GET /api/payments/history` - Historique des paiements
- `POST /api/payments/:id/refund` - Rembourser un paiement

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 