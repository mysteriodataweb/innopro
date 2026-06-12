# InnoFaso — Fullstack Complet (Solange + Alfred)

> Fusion des branches **solange** (base) + **Alfred** (planning avancé + IA)

## Stack
- **Backend** : Node.js / Express / PostgreSQL
- **Frontend** : React / Vite / Tailwind CSS

## Démarrage rapide

```bash
# 1. Base de données
psql $DATABASE_URL -f backend/migrations/run.js
# Ou manuellement dans l'ordre :
# migrations/sql/001 → 013

# 2. Backend
cd backend && npm install && npm run dev   # port 5000

# 3. Frontend
cd frontend && npm install && npm run dev  # port 3000
```

## Variables d'environnement — `backend/.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/innofaso_db2
JWT_SECRET=secret_jwt_ici
JWT_REFRESH_SECRET=secret_refresh_ici
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads
GROQ_API_KEY=votre_cle_groq   # Pour la génération IA de formulaires (optionnel)
GROQ_MODEL=llama-3.3-70b-versatile
```

## Fonctionnalités complètes

### Commun aux deux modules
| Fonctionnalité | Description |
|---|---|
| Authentification JWT | Login / refresh token / logout |
| Formulaires | CRUD complet + soft delete + restauration |
| Builder de champs | Drag & drop, types : Texte/Nombre/Date/Heure/Booléen/Liste/Signature/Photo |
| Auto date/heure | Pré-remplissage automatique à la saisie |
| Dropdown signataires | Sélection depuis la liste des utilisateurs |
| Soumissions | Soumettre, valider, rejeter, filtrer par période |
| Export Excel | Soumissions + stock (ExcelJS, coloré) |
| Alertes | FORMULAIRE_EN_RETARD / STOCK_BAS / PANNE_CRITIQUE / STOCK_MP_BAS |
| Matières premières | CRUD + mouvements (entrée/sortie/ajustement) + stats |
| Historique | Liste filtrée des soumissions passées |

### Module Maintenance
| Fonctionnalité | Description |
|---|---|
| Équipements | CRUD + liaison lignes |
| Planning avancé | Semaines, quarts (A/B/C), assignation maintenanciers |
| Lignes de production | L1, L2, L4 (CRUD) |
| Stock pièces rechange | Mouvements entrée/sortie |
| Dashboard maintenance | KPIs, graphiques, taux disponibilité par ligne |
| Espace technicien | Vue dédiée avec formulaires et soumissions personnelles |
| Génération IA | Modification formulaire par prompt (GROQ) |

### Module Production
| Fonctionnalité | Description |
|---|---|
| Matières premières | Suivi complet avec catégories, fournisseurs, seuils |
| Espace opérateur | Vue dédiée Production |

### Administration
| Fonctionnalité | Description |
|---|---|
| Utilisateurs | CRUD + rôles + activer/désactiver |
| Générateur Excel | Import de formulaires depuis tableur |
| Rate limiting | 500 req/15min par IP |
| Audit logs | Traçabilité des actions |

## Architecture
```
innofaso-final/
├── backend/
│   ├── src/
│   │   ├── modules/         # alertes, auth, dashboard, equipements,
│   │   │                    # formulaires, lignes, matieres, planning,
│   │   │                    # rapports, soumissions, stock, users
│   │   ├── services/        # planningSync, formAi, formSchema
│   │   ├── jobs/            # alertes.cron.js
│   │   └── middleware/      # auth, roles, validate, auditLogger
│   └── migrations/sql/      # 001 → 013
└── frontend/
    ├── src/
    │   ├── pages/           # 20+ pages
    │   ├── components/      # layout, form-builder, planning, ui
    │   └── services/api.js  # API unifiée (toutes les routes)
    └── vite.config.js       # proxy /api → /api/v1
```

## Rôles et accès
| Rôle | Module | Accès |
|---|---|---|
| ADMIN | Choix | Tout + administration |
| RESP_MAINT | MAINTENANCE | Lecture/écriture + validation |
| TECHNICIEN | MAINTENANCE | Saisie + espace dédié |
| RESP_PROD | PRODUCTION | Lecture/écriture + validation |
| OPERATEUR | PRODUCTION | Saisie + espace dédié |
