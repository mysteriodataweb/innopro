-- ================================================================
-- INNOFASO — Schema complet base de données (tout-en-un)
-- À exécuter sur innofaso_db2 vide (après CREATE DATABASE)
-- ================================================================

-- ── EXTENSIONS ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUMS ───────────────────────────────────────────────────────
CREATE TYPE etat_equipement AS ENUM ('OPERATIONNEL','EN_PANNE','EN_MAINTENANCE');
CREATE TYPE module_formulaire AS ENUM ('MAINTENANCE','PRODUCTION');
CREATE TYPE frequence_formulaire AS ENUM ('JOURNALIER','HEBDO','MENSUEL','TRIMESTRIEL','SEMESTRIEL','ANNUEL','AU_BESOIN','HEBDOMADAIRE');
CREATE TYPE type_champ AS ENUM ('TEXTE','NOMBRE','DATE','HEURE','BOOLEEN','LISTE','SIGNATURE','CALCULE','PHOTO');
CREATE TYPE statut_soumission AS ENUM ('BROUILLON','SOUMIS','VALIDE','REJETE','APPROUVE','EN_ATTENTE');
CREATE TYPE source_soumission AS ENUM ('EN_LIGNE','HORS_LIGNE');
CREATE TYPE type_alerte AS ENUM ('MAINTENANCE_PREVENTIVE','FORMULAIRE_EN_RETARD','PANNE_CRITIQUE','STOCK_BAS','STOCK_MP_BAS','NOUVELLE_SOUMISSION');
CREATE TYPE statut_alerte AS ENUM ('NON_LUE','LUE','TRAITEE');
CREATE TYPE statut_planning AS ENUM ('PLANIFIE','EN_COURS','REALISE','EN_RETARD');
CREATE TYPE action_audit AS ENUM ('INSERT','UPDATE','DELETE');
CREATE TYPE type_mouvement AS ENUM ('ENTREE','SORTIE');
CREATE TYPE type_mouvement_mp AS ENUM ('ENTREE','SORTIE','AJUSTEMENT');

-- ── ROLES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
);

-- ── UTILISATEURS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS utilisateurs (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id             UUID         NOT NULL REFERENCES roles(id),
  nom                 VARCHAR(100) NOT NULL,
  prenom              VARCHAR(100) NOT NULL,
  email               VARCHAR(255) NOT NULL UNIQUE,
  mot_de_passe        TEXT         NOT NULL,
  actif               BOOLEAN      NOT NULL DEFAULT TRUE,
  derniere_connexion  TIMESTAMP,
  token_reset         VARCHAR(255),
  token_reset_expire  TIMESTAMP,
  cree_le             TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_role  ON utilisateurs(role_id);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_actif ON utilisateurs(actif);

-- ── LIGNES DE PRODUCTION ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ligne_production (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        VARCHAR(20) NOT NULL UNIQUE,
  nom         VARCHAR(100) NOT NULL,
  description TEXT,
  actif       BOOLEAN     NOT NULL DEFAULT TRUE,
  cree_le     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO ligne_production (code, nom) VALUES
  ('L1','Ligne de production 1'),
  ('L2','Ligne de production 2'),
  ('L4','Ligne de production 4')
ON CONFLICT (code) DO NOTHING;

-- ── EQUIPEMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS equipements (
  id                    UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_ref              VARCHAR(50)  NOT NULL UNIQUE,
  nom                   VARCHAR(200) NOT NULL,
  ligne_id              UUID         REFERENCES ligne_production(id),
  ligne_production      VARCHAR(100),
  localisation          VARCHAR(200),
  type_equipement       VARCHAR(100),
  etat                  etat_equipement NOT NULL DEFAULT 'OPERATIONNEL',
  date_installation     DATE,
  actif                 BOOLEAN      NOT NULL DEFAULT TRUE,
  prochaine_maintenance DATE,
  cree_le               TIMESTAMP    NOT NULL DEFAULT NOW(),
  modifie_le            TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_equipements_etat  ON equipements(etat);
CREATE INDEX IF NOT EXISTS idx_equipements_ligne ON equipements(ligne_production);
CREATE INDEX IF NOT EXISTS idx_equipements_actif ON equipements(actif);

-- ── FORMULAIRES TYPES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS formulaires_types (
  id          UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        VARCHAR(60)  NOT NULL UNIQUE,
  titre       VARCHAR(300) NOT NULL,
  module      module_formulaire    NOT NULL,
  frequence   frequence_formulaire NOT NULL,
  description TEXT,
  version     INTEGER     NOT NULL DEFAULT 1,
  actif       BOOLEAN     NOT NULL DEFAULT TRUE,
  cree_le     TIMESTAMP   NOT NULL DEFAULT NOW(),
  modifie_le  TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ft_module    ON formulaires_types(module);
CREATE INDEX IF NOT EXISTS idx_ft_frequence ON formulaires_types(frequence);
CREATE INDEX IF NOT EXISTS idx_ft_code      ON formulaires_types(code);
CREATE INDEX IF NOT EXISTS idx_ft_actif     ON formulaires_types(actif);

-- ── CHAMPS DEFINITIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS champs_definitions (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  formulaire_type_id  UUID         NOT NULL REFERENCES formulaires_types(id) ON DELETE CASCADE,
  champ_source_id     UUID         REFERENCES champs_definitions(id) ON DELETE SET NULL,
  nom_champ           VARCHAR(300) NOT NULL,
  label               VARCHAR(300),
  type_champ          type_champ   NOT NULL,
  section             VARCHAR(200),
  ordre               INTEGER      NOT NULL DEFAULT 0,
  taille_colonne      INTEGER      DEFAULT 12,
  obligatoire         BOOLEAN      NOT NULL DEFAULT FALSE,
  validation_regex    VARCHAR(500),
  valeur_min          DECIMAL(15,4),
  valeur_max          DECIMAL(15,4),
  longueur_max        INTEGER,
  placeholder         VARCHAR(200),
  aide                TEXT,
  unite               VARCHAR(50),
  options_liste       JSONB,
  formule             TEXT,
  dependances         JSONB,
  condition_affichage JSONB,
  est_visible         BOOLEAN      NOT NULL DEFAULT TRUE,
  est_modifiable      BOOLEAN      NOT NULL DEFAULT TRUE,
  actif               BOOLEAN      NOT NULL DEFAULT TRUE,
  version             INTEGER      NOT NULL DEFAULT 1,
  cree_le             TIMESTAMP    NOT NULL DEFAULT NOW(),
  modifie_le          TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cd_formulaire ON champs_definitions(formulaire_type_id);
CREATE INDEX IF NOT EXISTS idx_cd_ordre      ON champs_definitions(formulaire_type_id, ordre);
CREATE INDEX IF NOT EXISTS idx_cd_type       ON champs_definitions(type_champ);
CREATE INDEX IF NOT EXISTS idx_cd_actif      ON champs_definitions(actif);

-- ── SOUMISSIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS soumissions (
  id                  UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  formulaire_type_id  UUID      NOT NULL REFERENCES formulaires_types(id),
  utilisateur_id      UUID      NOT NULL REFERENCES utilisateurs(id),
  equipement_id       UUID      REFERENCES equipements(id),
  statut              statut_soumission NOT NULL DEFAULT 'BROUILLON',
  date_soumission     TIMESTAMP NOT NULL DEFAULT NOW(),
  date_modification   TIMESTAMP,
  source              source_soumission NOT NULL DEFAULT 'EN_LIGNE',
  id_local            UUID,
  cree_localement_le  TIMESTAMP,
  synchronise_le      TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_soum_formulaire  ON soumissions(formulaire_type_id);
CREATE INDEX IF NOT EXISTS idx_soum_utilisateur ON soumissions(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_soum_equipement  ON soumissions(equipement_id);
CREATE INDEX IF NOT EXISTS idx_soum_date        ON soumissions(date_soumission DESC);
CREATE INDEX IF NOT EXISTS idx_soum_statut      ON soumissions(statut);
CREATE INDEX IF NOT EXISTS idx_soum_id_local    ON soumissions(id_local);

-- ── ENTETES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entetes (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  soumission_id          UUID NOT NULL UNIQUE REFERENCES soumissions(id) ON DELETE CASCADE,
  emetteur_nom           VARCHAR(200),
  emetteur_fonction      VARCHAR(200),
  emetteur_date          DATE,
  emetteur_signature     TEXT,
  verificateur_nom       VARCHAR(200),
  verificateur_fonction  VARCHAR(200),
  verificateur_date      DATE,
  verificateur_signature TEXT,
  approbateur_nom        VARCHAR(200),
  approbateur_fonction   VARCHAR(200),
  approbateur_date       DATE,
  approbateur_signature  TEXT
);

-- ── VALEURS SAISIES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS valeurs_saisies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  soumission_id   UUID NOT NULL REFERENCES soumissions(id) ON DELETE CASCADE,
  champ_def_id    UUID NOT NULL REFERENCES champs_definitions(id),
  valeur_texte    TEXT,
  valeur_nombre   DECIMAL(15,4),
  valeur_date     DATE,
  valeur_booleen  BOOLEAN,
  valeur_json     JSONB,
  est_conforme    BOOLEAN
);
CREATE INDEX IF NOT EXISTS idx_vs_soumission ON valeurs_saisies(soumission_id);
CREATE INDEX IF NOT EXISTS idx_vs_champ      ON valeurs_saisies(champ_def_id);

-- ── PIECES JOINTES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pieces_jointes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  soumission_id UUID NOT NULL REFERENCES soumissions(id) ON DELETE CASCADE,
  nom_fichier   VARCHAR(300) NOT NULL,
  url_stockage  TEXT NOT NULL,
  type_mime     VARCHAR(100),
  taille_octets INTEGER,
  cree_le       TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pj_soumission ON pieces_jointes(soumission_id);

-- ── ALERTES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alertes (
  id              UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  soumission_id   UUID      REFERENCES soumissions(id),
  equipement_id   UUID      REFERENCES equipements(id),
  utilisateur_id  UUID      NOT NULL REFERENCES utilisateurs(id),
  type_alerte     type_alerte   NOT NULL,
  message         TEXT          NOT NULL,
  statut          statut_alerte NOT NULL DEFAULT 'NON_LUE',
  date_creation   TIMESTAMP     NOT NULL DEFAULT NOW(),
  date_envoi      TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_alertes_utilisateur ON alertes(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_alertes_statut      ON alertes(statut);
CREATE INDEX IF NOT EXISTS idx_alertes_type        ON alertes(type_alerte);
CREATE INDEX IF NOT EXISTS idx_alertes_date        ON alertes(date_creation DESC);

-- ── PLANNINGS MAINTENANCE (basique) ─────────────────────────────
CREATE TABLE IF NOT EXISTS plannings_maintenance (
  id                  UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  formulaire_type_id  UUID    NOT NULL REFERENCES formulaires_types(id),
  equipement_id       UUID    NOT NULL REFERENCES equipements(id),
  technicien_id       UUID    NOT NULL REFERENCES utilisateurs(id),
  date_prevue         DATE    NOT NULL,
  date_realisee       DATE,
  statut              statut_planning NOT NULL DEFAULT 'PLANIFIE',
  commentaire         TEXT,
  cree_le             TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_plan_date       ON plannings_maintenance(date_prevue);
CREATE INDEX IF NOT EXISTS idx_plan_statut     ON plannings_maintenance(statut);
CREATE INDEX IF NOT EXISTS idx_plan_technicien ON plannings_maintenance(technicien_id);
CREATE INDEX IF NOT EXISTS idx_plan_equipement ON plannings_maintenance(equipement_id);

-- ── STOCK PIECES RECHANGE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pieces_rechange (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipement_id   UUID         REFERENCES equipements(id),
  reference       VARCHAR(100) NOT NULL,
  designation     VARCHAR(300) NOT NULL,
  quantite_stock  INTEGER      NOT NULL DEFAULT 0 CHECK (quantite_stock >= 0),
  seuil_alerte    INTEGER      NOT NULL DEFAULT 5,
  unite           VARCHAR(50)  NOT NULL DEFAULT 'pièce',
  actif           BOOLEAN      NOT NULL DEFAULT TRUE,
  cree_le         TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mouvements_stock (
  id              UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  piece_id        UUID      NOT NULL REFERENCES pieces_rechange(id),
  utilisateur_id  UUID      NOT NULL REFERENCES utilisateurs(id),
  type_mouvement  type_mouvement NOT NULL,
  quantite        INTEGER   NOT NULL CHECK (quantite > 0),
  date_mouvement  TIMESTAMP NOT NULL DEFAULT NOW(),
  motif           TEXT
);
CREATE INDEX IF NOT EXISTS idx_mouv_piece ON mouvements_stock(piece_id);
CREATE INDEX IF NOT EXISTS idx_mouv_date  ON mouvements_stock(date_mouvement DESC);

-- ── AUDIT LOGS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id               UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  utilisateur_id   UUID      REFERENCES utilisateurs(id),
  table_cible      VARCHAR(100),
  enregistrement_id UUID,
  action           action_audit NOT NULL,
  ancienne_valeur  JSONB,
  nouvelle_valeur  JSONB,
  adresse_ip       VARCHAR(50),
  appareil         TEXT,
  date_action      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_user   ON audit_logs(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_audit_table  ON audit_logs(table_cible);
CREATE INDEX IF NOT EXISTS idx_audit_date   ON audit_logs(date_action DESC);

-- ── MATIERES PREMIERES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matieres_premieres (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference        VARCHAR(100) NOT NULL UNIQUE,
  designation      VARCHAR(300) NOT NULL,
  categorie        VARCHAR(100),
  fournisseur      VARCHAR(200),
  unite            VARCHAR(50)  NOT NULL DEFAULT 'kg',
  quantite_stock   NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (quantite_stock >= 0),
  seuil_alerte     NUMERIC(12,3) NOT NULL DEFAULT 50,
  prix_unitaire    NUMERIC(10,2),
  emplacement      VARCHAR(200),
  actif            BOOLEAN      NOT NULL DEFAULT TRUE,
  cree_le          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  modifie_le       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mouvements_matieres (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  matiere_id       UUID         NOT NULL REFERENCES matieres_premieres(id),
  utilisateur_id   UUID         NOT NULL REFERENCES utilisateurs(id),
  type_mouvement   type_mouvement_mp NOT NULL,
  quantite         NUMERIC(12,3) NOT NULL CHECK (quantite > 0),
  date_mouvement   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  motif            TEXT,
  bon_livraison    VARCHAR(100),
  lot              VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_mouv_mp_matiere ON mouvements_matieres(matiere_id);
CREATE INDEX IF NOT EXISTS idx_mouv_mp_date    ON mouvements_matieres(date_mouvement DESC);
CREATE INDEX IF NOT EXISTS idx_mp_actif        ON matieres_premieres(actif);
CREATE INDEX IF NOT EXISTS idx_mp_categorie    ON matieres_premieres(categorie);

-- ── QUARTS MAINTENANCE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quart_maintenance (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         VARCHAR(50)  NOT NULL,
  heure_debut INTEGER      NOT NULL,
  heure_fin   INTEGER      NOT NULL,
  description VARCHAR(100),
  CONSTRAINT quart_valide CHECK (heure_debut >= 0 AND heure_fin <= 24)
);
INSERT INTO quart_maintenance (nom, heure_debut, heure_fin, description) VALUES
  ('Quart A', 6,  14, 'Matin: 06h - 14h'),
  ('Quart B', 14, 22, 'Après-midi: 14h - 22h'),
  ('Quart C', 22, 6,  'Nuit: 22h - 06h (lendemain)')
ON CONFLICT DO NOTHING;

-- ── PLANNING SEMAINE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planning_semaine (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ligne_id             UUID NOT NULL REFERENCES ligne_production(id),
  date_debut_semaine   DATE NOT NULL,
  date_fin_semaine     DATE NOT NULL,
  semaine_num          INTEGER NOT NULL,
  annee                INTEGER NOT NULL,
  mois                 INTEGER,
  semaine_index        INTEGER CHECK (semaine_index IS NULL OR semaine_index BETWEEN 1 AND 4),
  admin_id             UUID NOT NULL REFERENCES utilisateurs(id),
  statut               VARCHAR(50) NOT NULL DEFAULT 'PUBLIE',
  notes                TEXT,
  cree_le              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_le           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_planning_semaine_mois
  ON planning_semaine(ligne_id, annee, mois, semaine_index)
  WHERE mois IS NOT NULL AND semaine_index IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_planning_semaine_ligne ON planning_semaine(ligne_id);
CREATE INDEX IF NOT EXISTS idx_planning_semaine_dates ON planning_semaine(date_debut_semaine, date_fin_semaine);

-- ── PLANNING JOUR ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planning_jour (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planning_semaine_id UUID NOT NULL REFERENCES planning_semaine(id) ON DELETE CASCADE,
  date_jour           DATE NOT NULL,
  jour_semaine        VARCHAR(20) NOT NULL,
  cree_le             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_planning_jour_semaine ON planning_jour(planning_semaine_id);
CREATE INDEX IF NOT EXISTS idx_planning_jour_date    ON planning_jour(date_jour);

-- ── PLANNING QUART ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planning_quart (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planning_jour_id    UUID NOT NULL REFERENCES planning_jour(id) ON DELETE CASCADE,
  quart_id            UUID NOT NULL REFERENCES quart_maintenance(id),
  maintenancier_id    UUID NOT NULL REFERENCES utilisateurs(id),
  co_maintenancier_id UUID REFERENCES utilisateurs(id),
  cree_le             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(planning_jour_id, quart_id)
);
CREATE INDEX IF NOT EXISTS idx_planning_quart_jour          ON planning_quart(planning_jour_id);
CREATE INDEX IF NOT EXISTS idx_planning_quart_maintenancier ON planning_quart(maintenancier_id);

-- ── INTERVENTION QUART ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS intervention_quart (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planning_quart_id           UUID NOT NULL REFERENCES planning_quart(id) ON DELETE CASCADE,
  equipement_id               UUID NOT NULL REFERENCES equipements(id),
  soumission_id               UUID REFERENCES soumissions(id) ON DELETE SET NULL,
  duree_arret_effectif        DECIMAL(10,2) NOT NULL DEFAULT 0,
  cause_indisponibilite       VARCHAR(500),
  observations                TEXT,
  temps_couverture            DECIMAL(10,2) NOT NULL DEFAULT 8.0,
  taux_disponibilite_calcule  DECIMAL(5,2),
  taux_cible                  DECIMAL(5,2) NOT NULL DEFAULT 90.0,
  statut                      VARCHAR(50) NOT NULL DEFAULT 'EN_ATTENTE',
  cree_le                     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_le                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_iq_quart     ON intervention_quart(planning_quart_id);
CREATE INDEX IF NOT EXISTS idx_iq_equipement ON intervention_quart(equipement_id);

-- Trigger calcul taux disponibilité intervention_quart
CREATE OR REPLACE FUNCTION calculer_taux_intervention_quart()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.temps_couverture > 0 THEN
    NEW.taux_disponibilite_calcule :=
      ROUND(((NEW.temps_couverture - NEW.duree_arret_effectif) / NEW.temps_couverture * 100)::NUMERIC, 2);
  ELSE
    NEW.taux_disponibilite_calcule := 0;
  END IF;
  NEW.modifie_le := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calc_taux_quart ON intervention_quart;
CREATE TRIGGER trg_calc_taux_quart
  BEFORE INSERT OR UPDATE ON intervention_quart
  FOR EACH ROW EXECUTE FUNCTION calculer_taux_intervention_quart();

-- ── INTERVENTION LIGNE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS intervention_ligne (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planning_quart_id         UUID NOT NULL UNIQUE REFERENCES planning_quart(id) ON DELETE CASCADE,
  ligne_id                  UUID NOT NULL REFERENCES ligne_production(id),
  duree_arret_agregee       DECIMAL(10,2) NOT NULL DEFAULT 0,
  temps_couverture          DECIMAL(10,2) NOT NULL DEFAULT 8.0,
  taux_disponibilite_calcule DECIMAL(5,2),
  taux_cible                DECIMAL(5,2) NOT NULL DEFAULT 90.0,
  cause_indisponibilite     VARCHAR(500),
  observations              TEXT,
  soumission_id             UUID REFERENCES soumissions(id) ON DELETE SET NULL,
  cree_le                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_le                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION calculer_taux_intervention_ligne()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.temps_couverture > 0 THEN
    NEW.taux_disponibilite_calcule :=
      ROUND(((NEW.temps_couverture - NEW.duree_arret_agregee) / NEW.temps_couverture * 100)::NUMERIC, 2);
  ELSE
    NEW.taux_disponibilite_calcule := 0;
  END IF;
  NEW.modifie_le := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calc_taux_ligne ON intervention_ligne;
CREATE TRIGGER trg_calc_taux_ligne
  BEFORE INSERT OR UPDATE ON intervention_ligne
  FOR EACH ROW EXECUTE FUNCTION calculer_taux_intervention_ligne();

-- ── SUIVI EQUIPEMENT ACTION ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS suivi_equipement_action (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipement_id   UUID NOT NULL REFERENCES equipements(id) ON DELETE CASCADE,
  mois            DATE NOT NULL,
  difficulte      TEXT,
  action          TEXT,
  responsable     VARCHAR(200),
  delai           DATE,
  cree_le         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_le      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(equipement_id, mois)
);

-- ── VUES DASHBOARD MAINTENANCE ──────────────────────────────────
DROP VIEW IF EXISTS v_maintenance_dashboard_mensuel;
CREATE VIEW v_maintenance_dashboard_mensuel AS
SELECT
  DATE_TRUNC('month', i.modifie_le)::DATE AS mois,
  pq.maintenancier_id,
  u.prenom || ' ' || u.nom AS maintenancier_nom,
  lp.code AS ligne_code,
  COUNT(DISTINCT i.id) AS nb_interventions,
  COALESCE(SUM(i.duree_arret_effectif), 0) AS total_duree_arret,
  AVG(i.taux_disponibilite_calcule) AS avg_taux_disponibilite,
  MAX(i.taux_disponibilite_calcule) AS max_taux_disponibilite,
  MIN(i.taux_disponibilite_calcule) AS min_taux_disponibilite,
  STRING_AGG(DISTINCT i.cause_indisponibilite, ' | ') FILTER (WHERE i.cause_indisponibilite IS NOT NULL) AS causes
FROM intervention_quart i
JOIN planning_quart pq ON i.planning_quart_id = pq.id
JOIN planning_jour pj ON pq.planning_jour_id = pj.id
JOIN planning_semaine ps ON pj.planning_semaine_id = ps.id
JOIN ligne_production lp ON ps.ligne_id = lp.id
JOIN utilisateurs u ON pq.maintenancier_id = u.id
GROUP BY DATE_TRUNC('month', i.modifie_le), pq.maintenancier_id, u.prenom, u.nom, lp.code;

DROP VIEW IF EXISTS v_maintenance_equipement_suivi;
CREATE VIEW v_maintenance_equipement_suivi AS
SELECT
  DATE_TRUNC('month', i.modifie_le)::DATE AS mois_annee,
  e.id AS equipement_id,
  e.nom AS equipement_nom,
  e.code_ref AS equipement_code,
  lp.code AS ligne_code,
  COALESCE(SUM(i.duree_arret_effectif), 0) AS total_maintenance_corrective,
  COUNT(DISTINCT i.id) AS nb_interventions,
  AVG(i.taux_disponibilite_calcule) AS avg_disponibilite,
  STRING_AGG(DISTINCT i.observations, ' | ') FILTER (WHERE i.observations IS NOT NULL) AS remarques
FROM intervention_quart i
JOIN equipements e ON i.equipement_id = e.id
JOIN planning_quart pq ON i.planning_quart_id = pq.id
JOIN planning_jour pj ON pq.planning_jour_id = pj.id
JOIN planning_semaine ps ON pj.planning_semaine_id = ps.id
LEFT JOIN ligne_production lp ON ps.ligne_id = lp.id
GROUP BY DATE_TRUNC('month', i.modifie_le), e.id, e.nom, e.code_ref, lp.code;

-- ── TABLE MIGRATIONS TRACKER ────────────────────────────────────
CREATE TABLE IF NOT EXISTS _migrations (
  id       SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  ran_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
