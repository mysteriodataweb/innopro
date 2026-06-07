# 🌿 InnoFaso v2 — Gestion Digitale des Formulaires

> Refonte complète basée sur le MCD officiel.
> Architecture EAV (Entity-Attribute-Value) avec tables dédiées PostgreSQL.

## 🗂️ Structure du projet

```
innofaso2/
├── schema.sql              ← Schéma PostgreSQL complet (MCD fidèle)
├── backend/
│   ├── src/
│   │   ├── config/db.js          ← Pool PostgreSQL
│   │   ├── middleware/auth.js    ← JWT + gestion des rôles
│   │   ├── controllers/
│   │   │   ├── auth.controller.js        ← Login / me / changePassword
│   │   │   ├── formulaire.controller.js  ← CRUD formulaires + CRUD champs
│   │   │   ├── soumission.controller.js  ← Soumissions EAV + sync offline
│   │   │   └── autres.controller.js      ← Utilisateurs, équipements,
│   │   │                                    alertes, stock, planning, dashboard
│   │   ├── routes/               ← 10 fichiers de routes
│   │   └── server.js             ← Express + middlewares sécurité
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/layout/    ← Layout, Sidebar, Header
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── FormulaireListPage.jsx    ← Liste + créer un formulaire
│   │   │   ├── FormulaireBuilderPage.jsx ← ⭐ Gérer champs dynamiquement
│   │   │   ├── FormulaireRemplirPage.jsx ← Saisie EAV dynamique
│   │   │   ├── SoumissionsPage.jsx
│   │   │   ├── SoumissionDetailPage.jsx  ← Lecture + validation
│   │   │   ├── EquipementsPage.jsx
│   │   │   ├── AlertesPage.jsx
│   │   │   ├── PlanningPage.jsx
│   │   │   ├── StockPage.jsx
│   │   │   └── UtilisateursPage.jsx
│   │   ├── services/api.js       ← Tous les appels API
│   │   ├── store/auth.jsx        ← AuthContext + permissions
│   │   └── styles/global.css     ← Tailwind + composants
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🚀 Installation

### 1. Base de données
```bash
# Créer la base et l'utilisateur
psql -U postgres -c "CREATE USER innofaso_user WITH PASSWORD 'votre_mdp';"
psql -U postgres -c "CREATE DATABASE innofaso_db OWNER innofaso_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE innofaso_db TO innofaso_user;"

# Importer le schéma (tables + données de référence)
psql -U innofaso_user -d innofaso_db -f schema.sql
```

### 2. Créer l'utilisateur Admin
```bash
cd backend
node -e "const b=require('bcryptjs');b.hash('Admin123!',12).then(h=>console.log(h));"
# Copier le hash affiché, puis :
psql -U innofaso_user -d innofaso_db
```
```sql
INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role_id)
VALUES (
  gen_random_uuid(),
  'COULIBALY', 'Omar',
  'admin@innofaso.bf',
  'COLLER_LE_HASH_ICI',
  (SELECT id FROM role WHERE nom = 'Admin')
);
```

### 3. Backend
```bash
cd backend
cp .env.example .env
# Renseigner DB_PASSWORD et JWT_SECRET dans .env
npm install
npm run dev
# → http://localhost:5000
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## 🧩 Architecture MCD — Tables principales

| Table              | Rôle |
|--------------------|------|
| `role`             | 5 rôles : Admin, Responsable, Technicien, Opérateur, Lecteur |
| `utilisateur`      | Comptes avec hash bcrypt, lien vers role |
| `equipement`       | Machines avec état (OPERATIONNEL / EN_PANNE / EN_MAINTENANCE) |
| `formulaire_type`  | Catalogue des formulaires (code, titre, module, fréquence) |
| `champ_definition` | Champs EAV d'un formulaire (nom, type, section, ordre, options) |
| `soumission`       | Une soumission = 1 formulaire rempli |
| `entete`           | Données entête officielle (émetteur, vérificateur, approbateur) |
| `valeur_saisie`    | Valeurs EAV : valeur_texte / valeur_nombre / valeur_date / valeur_booleen |
| `alerte`           | Alertes générées automatiquement (stock bas, retard, panne) |
| `planning_maintenance` | Planification préventive mensuelle |
| `piece_rechange`   | Stock pièces avec seuil d'alerte |
| `mouvement_stock`  | Historique entrées/sorties pièces |
| `audit_log`        | Journal d'audit de toutes les actions |

## 🔑 Types de champs disponibles

| Code        | Affichage dans le formulaire |
|-------------|------------------------------|
| `TEXTE`     | Champ texte libre |
| `NOMBRE`    | Input numérique (avec unité optionnelle) |
| `DATE`      | Sélecteur de date |
| `HEURE`     | Sélecteur d'heure |
| `BOOLEEN`   | Boutons Oui / Non |
| `LISTE`     | Menu déroulant (options définies dans le Builder) |
| `SIGNATURE` | Champ texte pour nom + fonction du signataire |
| `PHOTO`     | Placeholder (disponible sur mobile) |
| `CALCULE`   | Champ calculé (formule référençant d'autres champs) |

## ⭐ Fonctionnalité clé : Builder de formulaires

La page `/formulaires/:id/builder` permet :
- **Ajouter** un champ avec type, section, ordre, unité, options
- **Modifier** un champ existant
- **Supprimer** (désactiver) un champ
- **Réordonner** les champs avec les flèches ▲▼
- **Organiser par sections** (Identification, Contrôle, Observations, Validation…)
- **Modifier les infos** du formulaire (titre, module, fréquence)

Pour **créer un nouveau formulaire** :
1. Cliquer "Nouveau formulaire" dans la liste
2. Renseigner code, titre, module, fréquence
3. Être redirigé automatiquement vers le Builder
4. Ajouter les champs un par un

## 📡 API REST — Endpoints

```
# Auth
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/change-password

# Formulaires (CRUD complet)
GET    /api/formulaires
GET    /api/formulaires/:id          ← avec champs et sections
POST   /api/formulaires              ← créer un formulaire
PUT    /api/formulaires/:id          ← modifier
DELETE /api/formulaires/:id          ← désactiver

# Champs d'un formulaire (CRUD complet)
POST   /api/formulaires/:id/champs              ← ajouter un champ
PUT    /api/formulaires/:id/champs/:champId     ← modifier
DELETE /api/formulaires/:id/champs/:champId     ← désactiver
PUT    /api/formulaires/:id/champs/reordonner   ← réordonner

# Soumissions (EAV)
GET    /api/soumissions
GET    /api/soumissions/:id    ← avec entête + valeurs par section
POST   /api/soumissions        ← créer avec valeurs EAV
PATCH  /api/soumissions/:id/statut   ← valider / renvoyer
POST   /api/soumissions/sync   ← synchronisation hors-ligne

# Autres
GET/POST   /api/equipements
GET/POST   /api/utilisateurs
GET        /api/alertes
PATCH      /api/alertes/:id
GET/POST   /api/stock/pieces
POST       /api/stock/pieces/mouvement
GET/POST   /api/planning
GET        /api/dashboard/stats
GET        /api/dashboard/activite
GET        /api/dashboard/retard
GET        /api/dashboard/kpi
```

## 🔐 Rôles et permissions

| Rôle        | Voir | Remplir | Valider | Configurer | Gérer users |
|-------------|:----:|:-------:|:-------:|:----------:|:-----------:|
| Lecteur     | ✅   | ❌      | ❌      | ❌         | ❌          |
| Opérateur   | ✅   | ✅      | ❌      | ❌         | ❌          |
| Technicien  | ✅   | ✅      | ❌      | ❌         | ❌          |
| Responsable | ✅   | ✅      | ✅      | ✅         | ❌          |
| Admin       | ✅   | ✅      | ✅      | ✅         | ✅          |

## 🔮 Évolutions futures
- [ ] Export PDF des soumissions
- [ ] Service Worker + IndexedDB (mode hors-ligne complet)
- [ ] Notifications push
- [ ] Intégration Odoo ERP
- [ ] Dashboard analytique (OEE, MTBF, MTTR)
- [ ] Application mobile React Native
