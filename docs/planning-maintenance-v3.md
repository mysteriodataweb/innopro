# Planning Maintenance Complet - Documentation v3.0

## Vue d'ensemble

Le système de planning maintenance a été complètement restructuré pour supporter :

- **Planning hebdomadaire par ligne de production** (L1, L2, L4)
- **Gestion des quarts** (3 par jour: 06h-14h, 14h-22h, 22h-06h)
- **Assignation des maintenanciers** avec co-maintenanciers optionnels
- **Suivi des interventions de maintenance corrective** au niveau du quart
- **Calcul automatique du taux de disponibilité** des machines
- **Dashboard analytics** avec statistiques mensuelles et évolution graphique

---

## Architecture Base de Données

### Nouvelles tables créées

#### 1. `ligne_production`

Définit les lignes de production du site.

```sql
id UUID PRIMARY KEY
code VARCHAR(20) UNIQUE   -- L1, L2, L4
nom VARCHAR(100)          -- Ligne de production 1, etc.
description TEXT
actif BOOLEAN
cree_le TIMESTAMPTZ
```

**Données pré-insérées:**

- L1: Ligne de production 1
- L2: Ligne de production 2
- L4: Ligne de production 4

---

#### 2. `quart_maintenance`

Définit les 3 quarts de travail quotidiens.

```sql
id UUID PRIMARY KEY
nom VARCHAR(50)           -- Quart A, Quart B, Quart C
heure_debut INTEGER       -- 6, 14, 22
heure_fin INTEGER         -- 14, 22, 6
description VARCHAR(100)  -- Matin: 06h - 14h, etc.
```

**Données pré-insérées:**

- Quart A: 06h - 14h
- Quart B: 14h - 22h
- Quart C: 22h - 06h

---

#### 3. `planning_semaine`

Planning hebdomadaire pour une ligne de production.

```sql
id UUID PRIMARY KEY
ligne_id UUID              -- Référence à ligne_production
date_debut_semaine DATE
date_fin_semaine DATE
semaine_num INTEGER        -- 1-53
annee INTEGER
admin_id UUID              -- Admin qui a créé
statut VARCHAR(50)         -- BROUILLON, PUBLIE, etc.
notes TEXT
cree_le TIMESTAMPTZ
modifie_le TIMESTAMPTZ
UNIQUE(ligne_id, annee, semaine_num)
```

---

#### 4. `planning_jour`

Jours individuels dans une planning_semaine.

```sql
id UUID PRIMARY KEY
planning_semaine_id UUID   -- 1-1 avec planning_semaine
date_jour DATE
jour_semaine VARCHAR(20)   -- Lundi, Mardi, etc.
cree_le TIMESTAMPTZ
```

---

#### 5. `planning_quart`

Assignation des maintenanciers aux quarts.

```sql
id UUID PRIMARY KEY
planning_jour_id UUID      -- Jour spécifique
quart_id UUID              -- Quart (A, B, ou C)
maintenancier_id UUID      -- Maintenancier assigné
co_maintenancier_id UUID   -- Optional
cree_le TIMESTAMPTZ
UNIQUE(planning_jour_id, quart_id)
```

---

#### 6. `intervention_quart`

**Clé**: Les interventions de maintenance corrective effectuées lors d'un quart.

```sql
id UUID PRIMARY KEY
planning_quart_id UUID
equipement_id UUID         -- Machine sur laquelle intervention
duree_arret_effectif DECIMAL(10,2)  -- Heures
cause_indisponibilite VARCHAR(500)
observations TEXT
temps_couverture DECIMAL(10,2)      -- Généralement 8.0 h
taux_disponibilite_calcule DECIMAL(5,2)  -- AUTO CALCULÉ
taux_cible DECIMAL(5,2)             -- Fixé à 90.0
statut VARCHAR(50)         -- EN_ATTENTE, VALIDE, etc.
cree_le TIMESTAMPTZ
modifie_le TIMESTAMPTZ
```

**Formule de calcul du taux de disponibilité (TRIGGER):**
$$\text{Taux} = \frac{(\text{Temps Couverture} - \text{Durée Arrêt}) \times 100}{\text{Temps Couverture}}$$

---

### Modifications sur tables existantes

#### `equipement`

Ajout de `ligne_id` pour associer chaque équipement à sa ligne de production.

```sql
ALTER TABLE equipement ADD COLUMN ligne_id UUID REFERENCES ligne_production(id);
```

---

### Vues créées pour les analytics

#### 1. `v_maintenance_dashboard_mensuel`

Résumé mensuel par maintenancier et ligne.

```
mois | maintenancier_nom | ligne_code | nb_interventions
   | total_duree_arret | avg_taux_disponibilite | causes
```

#### 2. `v_maintenance_equipement_suivi`

Suivi par équipement groupé par mois/année.

```
mois_annee | equipement_nom | ligne_code | total_maintenance_corrective
         | nb_interventions | avg_disponibilite | remarques
```

---

## API Endpoints

### Planning Semaine

**POST /api/planning/semaine/creer-ou-recuperer**

```javascript
Request: {
  ligne_id: string,
  date_debut: "2026-06-01",
  semaine_num: 23,
  annee: 2026
}
Response: { planning_semaine object }
```

Crée automatiquement les 7 jours de la semaine + quarts.

**GET /api/planning/semaine/:planningSemaineId**

```javascript
Response: {
  planning: { id, ligne_code, nom, dates, ... },
  jours: [
    {
      id, date_jour, jour_semaine,
      quarts: [
        {
          id, quart_nom, maintenancier_nom, co_maintenancier_nom,
          interventions: [
            {
              id, equipement_nom, duree_arret,
              taux_disponibilite, cause_indisponibilite, observations
            }
          ]
        }
      ]
    }
  ]
}
```

**GET /api/planning/semaines/lister?ligne_id=X&annee=Y**
Liste tous les plannings pour une ligne et année.

---

### Assignation des maintenanciers

**POST /api/planning/quart/assigner**

```javascript
Request: {
  planning_jour_id: string,
  quartId: string,
  maintenancier_id: string,
  co_maintenancier_id: string (optionnel)
}
Response: { planning_quart object }
```

---

### Interventions de maintenance

**POST /api/planning/intervention/creer-ou-modifier**

```javascript
Request: {
  id: string (optionnel - pour modification),
  planning_quart_id: string (obligatoire),
  equipement_id: string,
  duree_arret_effectif: number (heures),
  cause_indisponibilite: string,
  observations: string,
  temps_couverture: number (default 8.0),
  statut: "EN_ATTENTE"
}
Response: {
  intervention object avec taux_disponibilite calculé
}
```

**DELETE /api/planning/intervention/:interventionId**
Supprime une intervention.

---

### Dashboard et statistiques

**GET /api/planning/dashboard/mensuel?mois=6&annee=2026&ligne_id=X**

```javascript
Response: [
  {
    mois: "2026-06-01",
    maintenancier_nom: "Jean Dupont",
    ligne_code: "L1",
    nb_interventions: 5,
    total_maintenance_corrective_heures: 12.5,
    avg_taux_disponibilite: 92.3,
    max_taux: 100,
    min_taux: 85,
  },
];
```

**GET /api/planning/suivi/equipements?mois=6&annee=2026&ligne_id=X**

```javascript
Response: [
  {
    equipement_nom: "Compresseur L1",
    equipement_code: "CMP-001",
    ligne_code: "L1",
    total_maintenance_corrective: 3.5,
    nb_interventions: 2,
    avg_disponibilite: 94.2,
    remarques: "Problème valve...",
  },
];
```

**GET /api/planning/graphique/evolution?annee=2026&ligne_id=X&equipement_id=X**

```javascript
Response: [
  {
    mois: "2026-01-01",
    equipement_nom: "Moteur L1",
    heures_maintenance: 2.5,
    nb_interventions: 1
  },
  { mois: "2026-02-01", ... }
]
```

---

### Utilitaires

**GET /api/planning/lignes/lister**

```javascript
Response: [
  { id: "...", code: "L1", nom: "Ligne de production 1", actif: true },
];
```

**GET /api/planning/quarts/lister**

```javascript
Response: [
  {
    id: "...",
    nom: "Quart A",
    heure_debut: 6,
    heure_fin: 14,
    description: "...",
  },
];
```

**GET /api/planning/maintenanciers/lister**

```javascript
Response: [
  {
    id: "...",
    nom: "Dupont",
    prenom: "Jean",
    email: "...",
    role_nom: "Technicien",
  },
];
```

---

## Interface Frontend

### 1. PlanningPage.jsx

**Localisation:** `/frontend/src/pages/PlanningPage.jsx`

**Fonctionnalités:**

- Sélection de la ligne de production
- Navigation semaine/année
- Affichage hebdomadaire avec jours dépliables
- 3 quarts par jour avec maintenanciers assignés
- Liste des interventions avec taux calculés
- Modaux pour assigner maintenanciers
- Modaux pour créer/éditer interventions

**Composants enfants:**

- `AssignMaintenancierModal`: Assigne maintenancier + co-maintenancier à un quart
- `InterventionRow`: Affiche une intervention individual avec actions
- `InterventionModal`: Création/édition d'intervention avec calcul taux

**Données affichées par intervention:**

- Équipement
- Durée d'arrêt effectif (en heures)
- Cause d'indisponibilité
- Observations
- Taux de disponibilité calculé automatiquement
- Taux cible (90%)

---

### 2. DashboardMaintenancePage.jsx

**Localisation:** `/frontend/src/pages/DashboardMaintenancePage.jsx`

**Sections:**

1. **KPIs du mois:**
   - Taux moyen de disponibilité
   - Nombre d'interventions
   - Total heures maintenance
   - Équipements suivis

2. **Résumé par maintenancier:**
   - Tableau avec: nom, ligne, interventions, heures, taux moyen, min/max

3. **Graphique d'évolution:**
   - Courbe de l'évolution des heures de maintenance par mois

4. **Suivi des équipements:**
   - Tableau: équipement, ligne, interventions, heures corrective, taux, remarques

---

## Services API Frontend

**Localisation:** `/frontend/src/services/api.js`

Les nouvelles méthodes du `planningAPI`:

```javascript
planningAPI = {
  // Planning semaine
  creerOuRecupererPlanningSemaine(data),
  obtenirPlanningSemaine(id),
  listerSemainesPlanifiees(params),

  // Quarts
  assignerMaintenancierQuart(data),

  // Interventions
  creerOuModifierIntervention(data),
  supprimerIntervention(id),

  // Dashboard
  dashboardMaintenanceMensuel(params),
  suiviEquipementMaintenance(params),
  graphiqueEvolutionMaintenance(params),

  // Utilitaires
  listerLignes(),
  listerQuarts(),
  listerMaintenanciers(),
}
```

---

## Flux de travail complet

### Scenario 1: Admin configure le planning de maintenance préventive

1. Admin ouvre **PlanningPage**
2. Sélectionne ligne L1, semaine 23, année 2026
3. Un planning est créé automatiquement avec:
   - 7 jours de la semaine
   - 3 quarts par jour
4. Pour chaque jour/quart:
   - Admin clique "Assigner"
   - Sélectionne maintenancier + co-maintenancier
   - Sauvegarde
5. Planning est maintenant prêt pour l'exécution

### Scenario 2: Maintenancier effectue maintenance corrective

1. Maintenancier travaille pendant son quart
2. Une panne survient sur machine CMP-001
3. Maintenancier remplit un **formulaire de maintenance corrective** (via soumission)
4. Le formulaire capture:
   - Durée d'arrêt effectif: 2 heures
   - Cause: "Joint défectueux"
   - Observations: "À remplacer semaine prochaine"
5. À la soumission, une intervention est créée dans `intervention_quart`
6. Taux de disponibilité calculé: (8.0 - 2.0) / 8.0 \* 100 = **75%**
7. Intervention apparaît dans le planning du jour/quart

### Scenario 3: Admin consulte le dashboard

1. Admin ouvre **DashboardMaintenancePage**
2. Sélectionne mois et ligne
3. Voit:
   - KPI: taux moyen 92%, 15 interventions, 37.5h corrective
   - Tableau maintenanciers avec statistiques
   - Graphique évolution heures
   - Tableau détail équipements
4. Peut exporter pour rapports

---

## Points de contrôle d'intégration

### Migration BD

```bash
# Appliquer la migration
psql -U user -d innofaso -f migrations/2026-06-03_planning_maintenance_complete.sql
```

### Vérifications post-migration

```sql
-- Vérifier les tables créées
SELECT * FROM ligne_production;  -- 3 lignes (L1, L2, L4)
SELECT * FROM quart_maintenance;  -- 3 quarts
SELECT COUNT(*) FROM planning_semaine;  -- Should be 0

-- Vérifier équipement a ligne_id
SELECT COUNT(*) FROM equipement WHERE ligne_id IS NOT NULL;

-- Vérifier les vues
SELECT * FROM v_maintenance_dashboard_mensuel LIMIT 1;
SELECT * FROM v_maintenance_equipement_suivi LIMIT 1;
```

### Démarrage backend

```bash
cd backend
npm install  # S'il y a nouvelles dépendances
npm start
```

### Vérification API

```bash
# Tester les endpoints
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/planning/lignes/lister
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/planning/quarts/lister
```

---

## Points clés à retenir

1. **Planning basé sur semaines**: Un planning par (ligne, semaine, année)
2. **Quarts immuables**: 3 quarts fixes quotidiens
3. **Maintenanciers assignés par quart**: Pas global
4. **Interventions liées aux quarts**: Chaque intervention appartient à un quart spécifique
5. **Taux calculé automatiquement**: via trigger PostgreSQL
6. **Synchronisation avec soumissions**: À implémenter selon règles métier
7. **Analytics par mois**: Vue groupée mensuelle pour dashboard

---

## À faire après implémentation

- [ ] Tester la migration BD complètement
- [ ] Tester tous les endpoints API
- [ ] Valider le calcul du taux de disponibilité
- [ ] Implémenter le formulaire de maintenance corrective dynamique
- [ ] Ajouter la synchronisation soumissions ↔ planning
- [ ] Tester le dashboard avec données réelles
- [ ] Ajouter export/impression des plannings
- [ ] Implémenter les notifications
- [ ] Ajouter validation des droits d'accès
- [ ] Optimiser les requêtes BD pour performances
