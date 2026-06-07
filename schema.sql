-- ================================================================
-- INNOFASO — Schéma PostgreSQL v2.0
-- Fidèle au MCD : approche EAV (Entity-Attribute-Value)
-- Tables : ROLE, UTILISATEUR, EQUIPEMENT, FORMULAIRE_TYPE,
--          CHAMP_DEFINITION, SOUMISSION, ENTETE, VALEUR_SAISIE,
--          PIECE_JOINTE, ALERTE, PLANNING_MAINTENANCE,
--          PIECE_RECHANGE, MOUVEMENT_STOCK, AUDIT_LOG
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUMS ──────────────────────────────────────────────────────
CREATE TYPE module_enum      AS ENUM ('MAINTENANCE','PRODUCTION');
CREATE TYPE frequence_enum   AS ENUM ('JOURNALIER','HEBDO','MENSUEL','TRIMESTRIEL','SEMESTRIEL','ANNUEL','AU_BESOIN');
CREATE TYPE type_champ_enum  AS ENUM ('TEXTE','NOMBRE','DATE','HEURE','BOOLEEN','LISTE','SIGNATURE','CALCULE','PHOTO');
CREATE TYPE statut_soum_enum AS ENUM ('BROUILLON','SOUMIS','VALIDE');
CREATE TYPE source_enum      AS ENUM ('EN_LIGNE','HORS_LIGNE');
CREATE TYPE etat_equip_enum  AS ENUM ('OPERATIONNEL','EN_PANNE','EN_MAINTENANCE');
CREATE TYPE type_alerte_enum AS ENUM ('MAINTENANCE_PREVENTIVE','FORMULAIRE_EN_RETARD','PANNE_CRITIQUE','STOCK_BAS');
CREATE TYPE statut_alerte_enum AS ENUM ('NON_LUE','LUE','TRAITEE');
CREATE TYPE statut_plan_enum AS ENUM ('PLANIFIE','EN_COURS','REALISE','EN_RETARD');
CREATE TYPE type_mvt_enum    AS ENUM ('ENTREE','SORTIE');
CREATE TYPE action_audit_enum AS ENUM ('INSERT','UPDATE','DELETE','LOGIN','EXPORT');

-- ── ROLE ───────────────────────────────────────────────────────
CREATE TABLE role (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         VARCHAR(50)  NOT NULL UNIQUE,
  description TEXT
);

INSERT INTO role (nom, description) VALUES
  ('Admin',       'Accès total : gestion utilisateurs, validation, configuration'),
  ('Responsable', 'Soumettre, valider, exporter les formulaires'),
  ('Technicien',  'Remplir les formulaires de maintenance'),
  ('Operateur',   'Remplir les formulaires de production'),
  ('Lecteur',     'Consultation uniquement, aucune modification');

-- ── UTILISATEUR ────────────────────────────────────────────────
CREATE TABLE utilisateur (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id            UUID NOT NULL REFERENCES role(id),
  nom                VARCHAR(100) NOT NULL,
  prenom             VARCHAR(100) NOT NULL,
  email              VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe       TEXT NOT NULL,
  actif              BOOLEAN NOT NULL DEFAULT TRUE,
  derniere_connexion TIMESTAMPTZ,
  token_reset        VARCHAR(200),
  cree_le            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── EQUIPEMENT ─────────────────────────────────────────────────
CREATE TABLE equipement (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_ref             VARCHAR(50) UNIQUE NOT NULL,
  nom                  VARCHAR(200) NOT NULL,
  ligne_production     VARCHAR(100),
  localisation         VARCHAR(200),
  type_equipement      VARCHAR(100),
  etat                 etat_equip_enum NOT NULL DEFAULT 'OPERATIONNEL',
  date_installation    DATE,
  actif                BOOLEAN NOT NULL DEFAULT TRUE,
  prochaine_maintenance DATE
);

-- ── FORMULAIRE_TYPE ────────────────────────────────────────────
CREATE TABLE formulaire_type (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code      VARCHAR(50) NOT NULL UNIQUE,
  titre     VARCHAR(300) NOT NULL,
  module    module_enum NOT NULL,
  frequence frequence_enum NOT NULL,
  actif     BOOLEAN NOT NULL DEFAULT TRUE,
  schema_json JSONB,
  schema_source VARCHAR(50),
  schema_version VARCHAR(20),
  cree_le   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CHAMP_DEFINITION ───────────────────────────────────────────
CREATE TABLE champ_definition (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formulaire_type_id UUID NOT NULL REFERENCES formulaire_type(id) ON DELETE CASCADE,
  champ_source_id    UUID REFERENCES champ_definition(id),  -- auto-référence pour champs calculés
  nom_champ          VARCHAR(200) NOT NULL,
  type_champ         type_champ_enum NOT NULL,
  section            VARCHAR(100),
  obligatoire        BOOLEAN NOT NULL DEFAULT FALSE,
  ordre              INTEGER NOT NULL DEFAULT 0,
  unite              VARCHAR(20),
  options_liste      JSONB,   -- ex: ["OK","NOK","N/A"]
  formule            TEXT,    -- ex: "heure_fin - heure_debut"
  actif              BOOLEAN NOT NULL DEFAULT TRUE,
  cree_le            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_champ_def_form ON champ_definition(formulaire_type_id, ordre);

-- ── SOUMISSION ─────────────────────────────────────────────────
CREATE TABLE soumission (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formulaire_type_id  UUID NOT NULL REFERENCES formulaire_type(id),
  utilisateur_id      UUID NOT NULL REFERENCES utilisateur(id),
  equipement_id       UUID REFERENCES equipement(id),
  statut              statut_soum_enum NOT NULL DEFAULT 'BROUILLON',
  date_soumission     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_modification   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source              source_enum NOT NULL DEFAULT 'EN_LIGNE',
  id_local            UUID,
  cree_localement_le  TIMESTAMPTZ,
  synchronise_le      TIMESTAMPTZ
);

CREATE INDEX idx_soumission_form    ON soumission(formulaire_type_id);
CREATE INDEX idx_soumission_user    ON soumission(utilisateur_id);
CREATE INDEX idx_soumission_statut  ON soumission(statut);
CREATE INDEX idx_soumission_date    ON soumission(date_soumission DESC);

-- ── ENTETE (1-1 avec SOUMISSION) ───────────────────────────────
CREATE TABLE entete (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  soumission_id          UUID NOT NULL UNIQUE REFERENCES soumission(id) ON DELETE CASCADE,
  emetteur_nom           VARCHAR(100),
  emetteur_fonction      VARCHAR(100),
  emetteur_date          DATE,
  emetteur_signature     TEXT,
  verificateur_nom       VARCHAR(100),
  verificateur_fonction  VARCHAR(100),
  verificateur_date      DATE,
  verificateur_signature TEXT,
  approbateur_nom        VARCHAR(100),
  approbateur_fonction   VARCHAR(100),
  approbateur_date       DATE,
  approbateur_signature  TEXT
);

-- ── VALEUR_SAISIE ──────────────────────────────────────────────
CREATE TABLE valeur_saisie (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  soumission_id  UUID NOT NULL REFERENCES soumission(id) ON DELETE CASCADE,
  champ_def_id   UUID NOT NULL REFERENCES champ_definition(id),
  valeur_texte   TEXT,
  valeur_nombre  DECIMAL(15,4),
  valeur_date    TIMESTAMPTZ,
  valeur_booleen BOOLEAN,
  valeur_json    JSONB,
  est_conforme   BOOLEAN
);

CREATE INDEX idx_valeur_soumission ON valeur_saisie(soumission_id);
CREATE INDEX idx_valeur_champ      ON valeur_saisie(champ_def_id);
CREATE UNIQUE INDEX idx_valeur_unique ON valeur_saisie(soumission_id, champ_def_id);

-- ── PIECE_JOINTE ───────────────────────────────────────────────
CREATE TABLE piece_jointe (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  soumission_id UUID NOT NULL REFERENCES soumission(id) ON DELETE CASCADE,
  nom_fichier   VARCHAR(255) NOT NULL,
  url_stockage  TEXT NOT NULL,
  type_mime     VARCHAR(100),
  date_upload   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ALERTE ─────────────────────────────────────────────────────
CREATE TABLE alerte (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  soumission_id UUID REFERENCES soumission(id),
  equipement_id UUID REFERENCES equipement(id),
  utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
  type_alerte   type_alerte_enum NOT NULL,
  message       TEXT NOT NULL,
  statut        statut_alerte_enum NOT NULL DEFAULT 'NON_LUE',
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_envoi    TIMESTAMPTZ
);

CREATE INDEX idx_alerte_user   ON alerte(utilisateur_id, statut);
CREATE INDEX idx_alerte_statut ON alerte(statut, date_creation DESC);

-- ── PLANNING_MAINTENANCE ───────────────────────────────────────
CREATE TABLE planning_maintenance (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  formulaire_type_id UUID NOT NULL REFERENCES formulaire_type(id),
  equipement_id      UUID NOT NULL REFERENCES equipement(id),
  technicien_id      UUID NOT NULL REFERENCES utilisateur(id),
  date_prevue        DATE NOT NULL,
  date_realisee      DATE,
  statut             statut_plan_enum NOT NULL DEFAULT 'PLANIFIE',
  commentaire        TEXT
);

CREATE INDEX idx_planning_date    ON planning_maintenance(date_prevue);
CREATE INDEX idx_planning_statut  ON planning_maintenance(statut);

-- ── PIECE_RECHANGE ─────────────────────────────────────────────
CREATE TABLE piece_rechange (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipement_id   UUID NOT NULL REFERENCES equipement(id),
  reference       VARCHAR(100) NOT NULL UNIQUE,
  designation     VARCHAR(300) NOT NULL,
  quantite_stock  INTEGER NOT NULL DEFAULT 0 CHECK (quantite_stock >= 0),
  seuil_alerte    INTEGER NOT NULL DEFAULT 0,
  unite           VARCHAR(20) NOT NULL DEFAULT 'pièce'
);

-- ── MOUVEMENT_STOCK ────────────────────────────────────────────
CREATE TABLE mouvement_stock (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  piece_id       UUID NOT NULL REFERENCES piece_rechange(id),
  utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
  type_mouvement type_mvt_enum NOT NULL,
  quantite       INTEGER NOT NULL CHECK (quantite > 0),
  date_mouvement TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  motif          TEXT
);

-- ── AUDIT_LOG ──────────────────────────────────────────────────
CREATE TABLE audit_log (
  id               BIGSERIAL PRIMARY KEY,
  utilisateur_id   UUID REFERENCES utilisateur(id),
  table_cible      VARCHAR(100),
  enregistrement_id UUID,
  action           action_audit_enum NOT NULL,
  ancienne_valeur  JSONB,
  nouvelle_valeur  JSONB,
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  adresse_ip       INET,
  appareil         TEXT
);

CREATE INDEX idx_audit_user      ON audit_log(utilisateur_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);

-- ── TRIGGER : date_modification soumission ─────────────────────
CREATE OR REPLACE FUNCTION set_date_modification()
RETURNS TRIGGER AS $$
BEGIN NEW.date_modification = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_soumission_modif
  BEFORE UPDATE ON soumission
  FOR EACH ROW EXECUTE FUNCTION set_date_modification();

-- ── TRIGGER : alerte stock bas ─────────────────────────────────
CREATE OR REPLACE FUNCTION alerte_stock_bas()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantite_stock <= NEW.seuil_alerte AND OLD.quantite_stock > OLD.seuil_alerte THEN
    INSERT INTO alerte (utilisateur_id, equipement_id, type_alerte, message)
    SELECT u.id, NEW.equipement_id, 'STOCK_BAS',
           'Stock bas : ' || NEW.designation || ' (' || NEW.quantite_stock || ' ' || NEW.unite || ' restants)'
    FROM utilisateur u JOIN role r ON u.role_id = r.id
    WHERE r.nom IN ('Admin','Responsable') AND u.actif = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_alerte_stock
  AFTER UPDATE ON piece_rechange
  FOR EACH ROW EXECUTE FUNCTION alerte_stock_bas();

-- ── VUES ───────────────────────────────────────────────────────
CREATE VIEW v_soumissions_completes AS
SELECT
  s.id, s.statut, s.date_soumission, s.source,
  ft.code AS form_code, ft.titre AS form_titre, ft.module, ft.frequence,
  u.nom || ' ' || u.prenom AS auteur,
  r.nom AS role_auteur,
  e.nom AS equipement, e.code_ref AS equipement_code
FROM soumission s
JOIN formulaire_type ft ON s.formulaire_type_id = ft.id
JOIN utilisateur u ON s.utilisateur_id = u.id
JOIN role r ON u.role_id = r.id
LEFT JOIN equipement e ON s.equipement_id = e.id;

CREATE VIEW v_formulaires_en_retard AS
SELECT
  ft.id, ft.code, ft.titre, ft.frequence,
  MAX(s.date_soumission) AS derniere_soumission,
  CASE ft.frequence
    WHEN 'JOURNALIER'   THEN 1
    WHEN 'HEBDO'        THEN 7
    WHEN 'MENSUEL'      THEN 30
    WHEN 'TRIMESTRIEL'  THEN 90
    WHEN 'SEMESTRIEL'   THEN 180
    WHEN 'ANNUEL'       THEN 365
    ELSE NULL
  END AS jours_periodicite,
  CURRENT_DATE - MAX(s.date_soumission)::date AS jours_retard
FROM formulaire_type ft
LEFT JOIN soumission s ON ft.id = s.formulaire_type_id AND s.statut = 'VALIDE'
WHERE ft.actif = TRUE AND ft.frequence != 'AU_BESOIN'
GROUP BY ft.id, ft.code, ft.titre, ft.frequence
HAVING (CURRENT_DATE - MAX(s.date_soumission)::date) > CASE ft.frequence
    WHEN 'JOURNALIER' THEN 1 WHEN 'HEBDO' THEN 7 WHEN 'MENSUEL' THEN 30
    WHEN 'TRIMESTRIEL' THEN 90 WHEN 'SEMESTRIEL' THEN 180 WHEN 'ANNUEL' THEN 365
    ELSE 99999 END
   OR MAX(s.date_soumission) IS NULL;

-- ── DONNÉES DE RÉFÉRENCE : 52 formulaires + leurs champs ───────
-- On insère quelques formulaires représentatifs avec leurs champs complets

-- Compresseur d'air (journalier)
INSERT INTO formulaire_type (code, titre, module, frequence) VALUES
('PS-ME-EN-CAQ-A','Enregistrement Quotidien Compresseur d''Air','MAINTENANCE','JOURNALIER');

INSERT INTO champ_definition (formulaire_type_id, nom_champ, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-CAQ-A'),'N° Compresseur','TEXTE','Identification',true,1,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-CAQ-A'),'Filtrante Natte','LISTE','Contrôle',false,2,'["OK","Nettoyé","À changer"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-CAQ-A'),'Niveau huile refroidissement','LISTE','Contrôle',false,3,'["Haut","Bas","Appoint fait"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-CAQ-A'),'Heure totale fonctionnement','NOMBRE','Relevés',false,4,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-CAQ-A'),'Poussière / fuite','LISTE','Contrôle',false,5,'["Non","Oui"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-CAQ-A'),'Fonctionnement sécheur','LISTE','Contrôle',false,6,'["OK","Panne"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-CAQ-A'),'Pression cuve stockage (Bar)','NOMBRE','Relevés',false,7,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-CAQ-A'),'État électrovanne purge cuve','LISTE','Contrôle',false,8,'["OK","Défaut"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-CAQ-A'),'Observation','TEXTE','Observations',false,9,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-CAQ-A'),'Réparation si nécessaire','TEXTE','Observations',false,10,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-CAQ-A'),'Signature technicien','SIGNATURE','Validation',true,11,NULL);

-- Maintenance broyeurs (mensuel)
INSERT INTO formulaire_type (code, titre, module, frequence) VALUES
('PS-ME-EN-MBR-A','Enregistrement mensuel de Maintenance des Broyeurs','MAINTENANCE','MENSUEL');

INSERT INTO champ_definition (formulaire_type_id, nom_champ, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-MBR-A'),'Mois','TEXTE','Identification',true,1,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-MBR-A'),'Date contrôle','DATE','Contrôle',true,2,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-MBR-A'),'Broyeur','LISTE','Contrôle',true,3,'["Broyeur 1 (Optinut)","Broyeur 2 (Optinut)","Broyeur 3 (2Nut)"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-MBR-A'),'Fuite joint à lèvre sur axe','LISTE','Contrôle',false,4,'["Non","Oui"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-MBR-A'),'Fonctionnement machine et bruit','LISTE','Contrôle',false,5,'["OK","NOK"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-MBR-A'),'Réparations si nécessaire','TEXTE','Observations',false,6,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-MBR-A'),'Signature','SIGNATURE','Validation',true,7,NULL);

-- Cahier de passation de quart (journalier)
INSERT INTO formulaire_type (code, titre, module, frequence) VALUES
('PO-AP-EN-CDP-B','Cahier de passation de Quart','PRODUCTION','JOURNALIER');

INSERT INTO champ_definition (formulaire_type_id, nom_champ, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Semaine','TEXTE','Identification',true,1,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Nom Chef de Quart','TEXTE','Identification',true,2,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Quart','LISTE','Identification',true,3,'["QUART 1 (06h-14h)","QUART 2 (14h-22h)","QUART 3 (22h-06h)"]'),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Nombre de mélanges','NOMBRE','Atelier Pesée',false,4,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Matières déjà pesées','NOMBRE','Atelier Pesée',false,5,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Problème machine Pesée','TEXTE','Atelier Pesée',false,6,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Nombre de prémélanges','NOMBRE','Atelier Thermisation',false,7,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Prémélanges confirmés sur Origyn','NOMBRE','Atelier Thermisation',false,8,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Nombre de Cartons','NOMBRE','Atelier Conditionnement',false,9,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Numéro dernier carton','TEXTE','Atelier Conditionnement',false,10,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Pertes produits finis (kG)','NOMBRE','Atelier Conditionnement',false,11,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Prélèvements déposés au Labo','BOOLEEN','Atelier Conditionnement',false,12,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Commentaires','TEXTE','Observations',false,13,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CDP-B'),'Signature','SIGNATURE','Validation',true,14,NULL);

-- Changement de produit (ponctuel)
INSERT INTO formulaire_type (code, titre, module, frequence) VALUES
('PO-AP-EN-CPE-B','Changement de produit sur le même équipement','PRODUCTION','AU_BESOIN');

INSERT INTO champ_definition (formulaire_type_id, nom_champ, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CPE-B'),'Produit précédent','TEXTE','Identification',true,1,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CPE-B'),'Nouveau produit','TEXTE','Identification',true,2,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CPE-B'),'N° lot nouveau produit','TEXTE','Identification',false,3,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CPE-B'),'Pré-mélange vidé','BOOLEEN','Étape 1 - Vider',true,4,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CPE-B'),'Quantité récupérée (kg)','NOMBRE','Étape 1 - Vider',false,5,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CPE-B'),'Mélangeur vidé','BOOLEEN','Étape 2 - Vider mélangeur',true,6,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CPE-B'),'Nettoyage sol et surfaces','BOOLEEN','Étape 3 - Nettoyage',false,7,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CPE-B'),'Nettoyage mélangeur','BOOLEEN','Étape 3 - Nettoyage',false,8,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CPE-B'),'Nettoyage broyeurs','BOOLEEN','Étape 3 - Nettoyage',false,9,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CPE-B'),'Rangement ligne terminé','BOOLEEN','Étape 4 - Rangement',false,10,NULL),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-CPE-B'),'Visa Contrôle Qualité','SIGNATURE','Validation',true,11,NULL);

-- Demande de reprise de production
INSERT INTO formulaire_type (code, titre, module, frequence) VALUES
('PO-AP-EN-DRP-B','Demande de Reprise de Production','PRODUCTION','AU_BESOIN');

INSERT INTO champ_definition (formulaire_type_id, nom_champ, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-DRP-B'),'Motif de l''arrêt','TEXTE','Arrêt',true,1),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-DRP-B'),'Date et heure de l''arrêt','HEURE','Arrêt',true,2),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-DRP-B'),'Opérations réalisées','TEXTE','Reprise',true,3),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-DRP-B'),'Contrôles effectués','TEXTE','Qualité',false,4),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-DRP-B'),'Décision','TEXTE','Qualité',false,5),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-DRP-B'),'Signature Production','SIGNATURE','Validation',true,6),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-DRP-B'),'Signature Qualité','SIGNATURE','Validation',true,7);

-- GE 275 Kva (hebdomadaire)
INSERT INTO formulaire_type (code, titre, module, frequence) VALUES
('PS-ME-EN-EHG-A','Entretien hebdomadaire du GE 275 Kva','MAINTENANCE','HEBDO');

INSERT INTO champ_definition (formulaire_type_id, nom_champ, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-EHG-A'),'Heures de fonctionnement','NOMBRE','Relevés',true,1,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-EHG-A'),'Niveau carburant (1-8)','NOMBRE','Contrôle',true,2,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-EHG-A'),'Conduites carburant OK','BOOLEEN','Contrôle',false,3,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-EHG-A'),'Niveau huile','LISTE','Contrôle',false,4,'["Haut","Bas","Appoint fait"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-EHG-A'),'Niveau liquide refroidissement','LISTE','Contrôle',false,5,'["OK","Bas","Appoint fait"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-EHG-A'),'Pales ventilateur OK','BOOLEEN','Contrôle',false,6,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-EHG-A'),'Circuit échappement OK','BOOLEEN','Contrôle',false,7,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-EHG-A'),'Tension courroie OK','BOOLEEN','Contrôle',false,8,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-EHG-A'),'Témoin obstruction filtre air','BOOLEEN','Contrôle',false,9,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-EHG-A'),'Système admission fuit','BOOLEEN','Contrôle',false,10,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-EHG-A'),'Mode machine','LISTE','État',false,11,'["AUTO","MANU","Arrêté"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-EHG-A'),'Signature','SIGNATURE','Validation',true,12,NULL);

-- Fiche de vie équipement (ponctuel)
INSERT INTO formulaire_type (code, titre, module, frequence) VALUES
('PS-ME-EN-FVE-A','Fiche de vie équipement / Fiche d''intervention','MAINTENANCE','AU_BESOIN');

INSERT INTO champ_definition (formulaire_type_id, nom_champ, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Désignation équipement','TEXTE','Matériel',true,1,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Code identification','TEXTE','Matériel',true,2,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Marque','TEXTE','Matériel',false,3,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Type / Modèle','TEXTE','Matériel',false,4,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'N° de série','TEXTE','Matériel',false,5,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Date mise en service','DATE','Matériel',false,6,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Date','DATE','Intervention',true,7,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Heure de début','HEURE','Intervention',true,8,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Heure de fin','HEURE','Intervention',true,9,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Nature intervention','LISTE','Intervention',true,10,'["Corrective","Préventive","Améliorative"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Description','TEXTE','Intervention',true,11,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Actions menées','TEXTE','Intervention',false,12,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Observations / Améliorations','TEXTE','Intervention',false,13,NULL),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Évaluation de l''intervention','LISTE','Évaluation',false,14,'["Satisfaisante","Partielle","À revoir"]'),
((SELECT id FROM formulaire_type WHERE code='PS-ME-EN-FVE-A'),'Signature technicien','SIGNATURE','Validation',true,15,NULL);

-- Indicateur gestion déchets (mensuel)
INSERT INTO formulaire_type (code, titre, module, frequence) VALUES
('PO-AP-EN-IGD-A','Indicateur de gestion des déchets','PRODUCTION','MENSUEL');

INSERT INTO champ_definition (formulaire_type_id, nom_champ, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-IGD-A'),'Mois','TEXTE','Identification',true,1),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-IGD-A'),'PF et PSF recyclés (kg)','NOMBRE','Déchets recyclés',false,2),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-IGD-A'),'Carton et sache recyclés (kg)','NOMBRE','Déchets recyclés',false,3),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-IGD-A'),'PF et PSF non revalorisés (kg)','NOMBRE','Déchets non revalorisés',false,4),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-IGD-A'),'Carton et sache non revalorisés (kg)','NOMBRE','Déchets non revalorisés',false,5),
((SELECT id FROM formulaire_type WHERE code='PO-AP-EN-IGD-A'),'Signature','SIGNATURE','Validation',true,6);
