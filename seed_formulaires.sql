-- ================================================================
-- INNOFASO v2 — Seed complet des formulaires manquants
-- 43 formulaires manquants sur 51 (8 déjà dans schema.sql)
-- Codes déjà seedés : PS-ME-EN-CAQ-A, PS-ME-EN-MBR-A, PO-AP-EN-CDP-B,
--   PO-AP-EN-CPE-B, PO-AP-EN-DRP-B, PS-ME-EN-EHG-A, PS-ME-EN-FVE-A, PO-AP-EN-IGD-A
-- ================================================================

-- ================================================================
-- MAINTENANCE — HEBDOMADAIRES (8 manquants sur 9)
-- ================================================================

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PO-ME-EN-CCH-A','Contrôle de cuve balance d''huile (PO)','MAINTENANCE','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PO-ME-EN-CCH-A'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PO-ME-EN-CCH-A'),'Poids utilisés (kg)','Poids utilisés (kg)','NOMBRE','Contrôle balance',true,2),
((SELECT id FROM formulaires_types WHERE code='PO-ME-EN-CCH-A'),'Écran IHM — VI','Écran IHM — VI','NOMBRE','Contrôle balance',false,3),
((SELECT id FROM formulaires_types WHERE code='PO-ME-EN-CCH-A'),'Écran IHM — VF','Écran IHM — VF','NOMBRE','Contrôle balance',false,4),
((SELECT id FROM formulaires_types WHERE code='PO-ME-EN-CCH-A'),'Réparations prévues','Réparations prévues','TEXTE','Réparations',false,5),
((SELECT id FROM formulaires_types WHERE code='PO-ME-EN-CCH-A'),'Réparations réalisées','Réparations réalisées','TEXTE','Réparations',false,6),
((SELECT id FROM formulaires_types WHERE code='PO-ME-EN-CCH-A'),'Signature','Signature','SIGNATURE','Validation',true,7);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PO-ME-EN-HTM-A','Habilitation des techniciens de maintenance','MAINTENANCE','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PO-ME-EN-HTM-A'),'Activité','Activité','TEXTE','Habilitation',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-ME-EN-HTM-A'),'Personnes habilitées','Personnes habilitées','TEXTE','Habilitation',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-ME-EN-HTM-A'),'Champs d''''application','Champs d''''application','TEXTE','Habilitation',false,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-ME-EN-HTM-A'),'Date','Date','DATE','Validation',true,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-ME-EN-HTM-A'),'Signature','Signature','SIGNATURE','Validation',true,5,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-CCH-A','Enregistrement de Contrôle Balance Cuve Huile','MAINTENANCE','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCH-A'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCH-A'),'Poids utilisés (kg)','Poids utilisés (kg)','NOMBRE','Contrôle balance',true,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCH-A'),'Écran IHM — VI','Écran IHM — VI','NOMBRE','Contrôle balance',false,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCH-A'),'Écran IHM — VF','Écran IHM — VF','NOMBRE','Contrôle balance',false,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCH-A'),'Réparations prévues','Réparations prévues','TEXTE','Réparations',false,5),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCH-A'),'Réparations réalisées','Réparations réalisées','TEXTE','Réparations',false,6),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCH-A'),'Signature','Signature','SIGNATURE','Validation',true,7);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-CCP-A','Enregistrement de Contrôle Cuve à Peson','MAINTENANCE','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCP-A'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCP-A'),'Poids de 20kg — VI','Poids de 20kg — VI','NOMBRE','Contrôle calibrage',true,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCP-A'),'Poids de 20kg — VF','Poids de 20kg — VF','NOMBRE','Contrôle calibrage',true,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCP-A'),'Écran 2NUT — VI','Écran 2NUT — VI','NOMBRE','Contrôle calibrage',false,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCP-A'),'Écran 2NUT — VF','Écran 2NUT — VF','NOMBRE','Contrôle calibrage',false,5),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCP-A'),'Réparations prévues','Réparations prévues','TEXTE','Réparations',false,6),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCP-A'),'Réparations réalisées','Réparations réalisées','TEXTE','Réparations',false,7),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CCP-A'),'Signature','Signature','SIGNATURE','Validation',true,8);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-CGA-A','Enregistrement hebdomadaire de Contrôle de la Grille Aimantée','MAINTENANCE','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CGA-A'),'Date du contrôle','Date du contrôle','DATE','Contrôle',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CGA-A'),'Présence de corps étrangers (quantité pesée)','Présence de corps étrangers (quantité pesée)','NOMBRE','Contrôle',false,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CGA-A'),'Nettoyé','Nettoyé','BOOLEEN','Contrôle',true,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CGA-A'),'Visa','Visa','SIGNATURE','Validation',true,4);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-DCA-A','Enregistrement hebdomadaire du Dust Collecteur et des Anneaux','MAINTENANCE','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DCA-A'),'Date du contrôle','Date du contrôle','DATE','Contrôle',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DCA-A'),'Fonctionnement général de l''''équipement','Fonctionnement général de l''''équipement','LISTE','Contrôle',true,2,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DCA-A'),'Vidanger le bac — quantité pesée (kg)','Vidanger le bac — quantité pesée (kg)','NOMBRE','Contrôle',false,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DCA-A'),'Nettoyer l''''anneau optinut','Nettoyer l''''anneau optinut','BOOLEEN','Contrôle',false,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DCA-A'),'Nettoyée l''''anneau 2NUT','Nettoyée l''''anneau 2NUT','BOOLEEN','Contrôle',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DCA-A'),'Visa','Visa','SIGNATURE','Validation',true,6,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-DPM-A','Enregistrement hebdomadaire de contrôle du Détecteur de Particules Métalliques','MAINTENANCE','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DPM-A'),'Ligne','Ligne','TEXTE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DPM-A'),'Dates','Dates','DATE','Contrôle',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DPM-A'),'État du tapis — alignement','État du tapis — alignement','LISTE','Contrôle',true,3,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DPM-A'),'Fonctionnement alarme sonore','Fonctionnement alarme sonore','LISTE','Contrôle',true,4,'["OK","Défaut"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DPM-A'),'Fonctionnement alarme visuel','Fonctionnement alarme visuel','LISTE','Contrôle',true,5,'["OK","Défaut"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DPM-A'),'Fonctionnement déflecteur','Fonctionnement déflecteur','LISTE','Contrôle',true,6,'["OK","Défaut"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-DPM-A'),'Visas','Visas','SIGNATURE','Validation',true,7,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MDO-A','Maintenance hebdomadaire de la Doseuse Nova','MAINTENANCE','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MDO-A'),'Ligne','Ligne','TEXTE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MDO-A'),'Semaine','Semaine','TEXTE','Identification',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MDO-A'),'Fuite de produit dans la douille','Fuite de produit dans la douille','BOOLEEN','Éléments à contrôler',false,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MDO-A'),'Fuite de produit dans la chambre de dosage','Fuite de produit dans la chambre de dosage','BOOLEEN','Éléments à contrôler',false,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MDO-A'),'Fonctionnement global machine','Fonctionnement global machine','LISTE','Éléments à contrôler',true,5,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MDO-A'),'Pression d''''air comprimé (bar)','Pression d''''air comprimé (bar)','NOMBRE','Éléments à contrôler',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MDO-A'),'Réparer si nécessaire','Réparer si nécessaire','BOOLEEN','Actions',false,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MDO-A'),'Observation','Observation','TEXTE','Actions',false,8,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MDO-A'),'Signature','Signature','SIGNATURE','Validation',true,9,NULL);

-- ================================================================
-- MAINTENANCE — JOURNALIERS (20 manquants sur 21)
-- ================================================================

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-EIC-A','Enregistrement de suivi Encre Imprimante Carton','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-EIC-A'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-EIC-A'),'Entrées','Entrées','NOMBRE','Mouvement stock',false,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-EIC-A'),'Sorties','Sorties','NOMBRE','Mouvement stock',false,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-EIC-A'),'Quantité','Quantité','NOMBRE','Mouvement stock',false,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-EIC-A'),'Stock final','Stock final','NOMBRE','Mouvement stock',true,5),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-EIC-A'),'Visas','Visas','SIGNATURE','Validation',true,6);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-ETE-A','Enregistrement travaux externes — Maintenance corrective des bâtiments','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ETE-A'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ETE-A'),'Entretien réalisé (toits, fenêtres, portes, lumière…)','Entretien réalisé (toits, fenêtres, portes, lumière…)','TEXTE','Travaux',true,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ETE-A'),'Observations','Observations','TEXTE','Travaux',false,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ETE-A'),'Visa','Visa','SIGNATURE','Validation',true,4);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-FDV-A','Fiche de vie des équipements','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'Désignation équipement','Désignation équipement','TEXTE','Matériel',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'Code identification','Code identification','TEXTE','Matériel',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'Marque / Type / Modèle','Marque / Type / Modèle','TEXTE','Matériel',false,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'N° de série','N° de série','TEXTE','Matériel',false,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'Fournisseur','Fournisseur','TEXTE','Matériel',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'Date de réception','Date de réception','DATE','Matériel',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'Date de mise en service','Date de mise en service','DATE','Matériel',false,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'Localisation','Localisation','TEXTE','Matériel',false,8,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'Contrat d''''entretien','Contrat d''''entretien','BOOLEEN','Contrat',false,9,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'N° du contrat','N° du contrat','TEXTE','Contrat',false,10,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'Responsable — Nom','Responsable — Nom','TEXTE','Responsable',true,11,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'Responsable — Prénom','Responsable — Prénom','TEXTE','Responsable',true,12,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FDV-A'),'Observations','Observations','TEXTE','Observations',false,13,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-FOH-A','Enregistrement journalier de maintenance du Fondoir à Huile','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FOH-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FOH-A'),'Absence de fuite au niveau de l''''agitateur et des tuyaux connectés au fondoir','Absence de fuite au niveau de l''''agitateur et des tuyaux connectés au fondoir','BOOLEEN','Éléments à vérifier',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FOH-A'),'Agitateur en marche','Agitateur en marche','BOOLEEN','Éléments à vérifier',true,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FOH-A'),'Le système de chauffe est fonctionnel','Le système de chauffe est fonctionnel','LISTE','Éléments à vérifier',true,4,'["OK","Défaut"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FOH-A'),'T° sonde eau','T° sonde eau','NOMBRE','Températures',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FOH-A'),'T° sonde produit','T° sonde produit','NOMBRE','Températures',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FOH-A'),'Observation','Observation','TEXTE','Observations',false,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FOH-A'),'Réparation si nécessaire','Réparation si nécessaire','BOOLEEN','Actions',false,8,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FOH-A'),'Signature','Signature','SIGNATURE','Validation',true,9,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-GCG-A','Gestion de la consommation des groupes électrogènes','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-GCG-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-GCG-A'),'Groupe Électrogène (type)','Groupe Électrogène (type)','TEXTE','Relevé',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-GCG-A'),'Heures de fonctionnement','Heures de fonctionnement','NOMBRE','Relevé',true,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-GCG-A'),'Quantité carburant reçue (L)','Quantité carburant reçue (L)','NOMBRE','Relevé',false,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-GCG-A'),'Niveau carburant dans le réservoir','Niveau carburant dans le réservoir','LISTE','Relevé',false,5,'["Haut","Moyen","Bas","Vide"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-GCG-A'),'Visa','Visa','SIGNATURE','Validation',true,6,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MCI-A','Enregistrement journalier de Maintenance de conditionneuse IMANPACK','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCI-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCI-A'),'Ligne','Ligne','TEXTE','Identification',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCI-A'),'Vérifier les interrupteurs de sécurité, boutons d''''urgence et pictogrammes','Vérifier les interrupteurs de sécurité, boutons d''''urgence et pictogrammes','LISTE','Éléments à contrôler',true,3,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCI-A'),'Vérifier la formation de sachet : spot, impression, soudure et Teeptrack','Vérifier la formation de sachet : spot, impression, soudure et Teeptrack','LISTE','Éléments à contrôler',true,4,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCI-A'),'Vérifier la cadence par Ligne (environ 50 sachets/mn)','Vérifier la cadence par Ligne (environ 50 sachets/mn)','NOMBRE','Éléments à contrôler',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCI-A'),'Vérifier que les coffrets de commande sont bien fermés','Vérifier que les coffrets de commande sont bien fermés','LISTE','Éléments à contrôler',true,6,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCI-A'),'Observations','Observations','TEXTE','Observations',false,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCI-A'),'Signature','Signature','SIGNATURE','Validation',true,8,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MCP-A','Enregistrement de Maintenance Corrective — Pannes','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCP-A'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCP-A'),'Heure','Heure','HEURE','Identification',true,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCP-A'),'Machine','Machine','TEXTE','Identification',true,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCP-A'),'Raisons d''''intervention','Raisons d''''intervention','TEXTE','Intervention',true,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCP-A'),'Actions','Actions','TEXTE','Intervention',true,5),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCP-A'),'Visa Maintenance','Visa Maintenance','SIGNATURE','Validation',true,6),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCP-A'),'Visa Qualité','Visa Qualité','SIGNATURE','Validation',false,7),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCP-A'),'Visa RT','Visa RT','SIGNATURE','Validation',false,8);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MCT-A','Enregistrement journalier de Maintenance Cuve Tampon','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCT-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCT-A'),'Agitateur en marche','Agitateur en marche','BOOLEEN','Contrôle',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCT-A'),'Présence de fuites agitateur','Présence de fuites agitateur','BOOLEEN','Contrôle',false,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCT-A'),'Chauffe en marche','Chauffe en marche','LISTE','Contrôle',true,4,'["OK","Défaut"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCT-A'),'T° sonde eau','T° sonde eau','NOMBRE','Températures',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCT-A'),'T° sonde produit','T° sonde produit','NOMBRE','Températures',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCT-A'),'Réparations prévues','Réparations prévues','TEXTE','Réparations',false,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCT-A'),'Réparations réalisées','Réparations réalisées','TEXTE','Réparations',false,8,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCT-A'),'Signature','Signature','SIGNATURE','Validation',true,9,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MEC-A','Enregistrement journalier de Maintenance Échangeur de Chaleur','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEC-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEC-A'),'Sonde J — présence de fuites','Sonde J — présence de fuites','BOOLEEN','Contrôle',false,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEC-A'),'Plaque échangeur — état','Plaque échangeur — état','LISTE','Contrôle',true,3,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEC-A'),'Pression (bar)','Pression (bar)','NOMBRE','Contrôle',false,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEC-A'),'Réparations prévues','Réparations prévues','TEXTE','Réparations',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEC-A'),'Réparations réalisées','Réparations réalisées','TEXTE','Réparations',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEC-A'),'Signature','Signature','SIGNATURE','Validation',true,7,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MJC-A','Enregistrement journalier de Maintenance de l''ensacheuse NEW','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MJC-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MJC-A'),'Ligne','Ligne','TEXTE','Identification',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MJC-A'),'Interrupteur sécurité en bon état et position','Interrupteur sécurité en bon état et position','LISTE','Éléments à contrôler',true,3,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MJC-A'),'Signes de sécurité et pictogrammes lisibles','Signes de sécurité et pictogrammes lisibles','LISTE','Éléments à contrôler',true,4,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MJC-A'),'Mâchoires — longitudinales et transversales (nettoyer si nécessaire)','Mâchoires — longitudinales et transversales (nettoyer si nécessaire)','LISTE','Éléments à contrôler',true,5,'["OK","Nettoyé","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MJC-A'),'Collier, tube de formage et contact avec le film (nettoyer si nécessaire)','Collier, tube de formage et contact avec le film (nettoyer si nécessaire)','LISTE','Éléments à contrôler',true,6,'["OK","Nettoyé","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MJC-A'),'Observations','Observations','TEXTE','Observations',false,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MJC-A'),'Réparer si nécessaire','Réparer si nécessaire','BOOLEEN','Actions',false,8,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MJC-A'),'Signature','Signature','SIGNATURE','Validation',true,9,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MPE-A','Enregistrement de Maintenance Préventive des Équipements','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPE-A'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPE-A'),'Heure','Heure','HEURE','Identification',true,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPE-A'),'Machines','Machines','TEXTE','Intervention',true,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPE-A'),'Raisons d''''intervention','Raisons d''''intervention','TEXTE','Intervention',true,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPE-A'),'Actions','Actions','TEXTE','Intervention',true,5),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPE-A'),'Visa Maintenance','Visa Maintenance','SIGNATURE','Validation',true,6),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPE-A'),'Visa Qualité','Visa Qualité','SIGNATURE','Validation',false,7),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPE-A'),'Visa RT','Visa RT','SIGNATURE','Validation',false,8);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MTH-A','Enregistrement journalier de Maintenance du Thermorégulateur','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MTH-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MTH-A'),'Durée de fonctionnement','Durée de fonctionnement','NOMBRE','Contrôle',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MTH-A'),'Fonctionnement pompe','Fonctionnement pompe','LISTE','Contrôle',true,3,'["OK","Défaut"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MTH-A'),'Voyant présence de tension allumé','Voyant présence de tension allumé','BOOLEEN','Contrôle',true,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MTH-A'),'Entretien prévu','Entretien prévu','TEXTE','Entretien',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MTH-A'),'Entretien réalisé','Entretien réalisé','TEXTE','Entretien',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MTH-A'),'Signature','Signature','SIGNATURE','Validation',true,7,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-NPE-A','Nettoyage des pièces en production','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-NPE-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-NPE-A'),'Équipement / Zone','Équipement / Zone','TEXTE','Nettoyage',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-NPE-A'),'Type de nettoyage','Type de nettoyage','LISTE','Nettoyage',true,3,'["Sec","Humide","Désinfection"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-NPE-A'),'Réalisé','Réalisé','BOOLEEN','Nettoyage',true,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-NPE-A'),'Observations','Observations','TEXTE','Observations',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-NPE-A'),'Signature','Signature','SIGNATURE','Validation',true,6,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-PAM-A','Planning des activités de maintenance (journalier)','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PAM-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PAM-A'),'Activités à planifier','Activités à planifier','TEXTE','Planning',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PAM-A'),'Période début','Période début','DATE','Planning',false,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PAM-A'),'Période fin','Période fin','DATE','Planning',false,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PAM-A'),'Report Oui/Non','Report Oui/Non','BOOLEEN','Planning',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PAM-A'),'Nouvelle date si reporté','Nouvelle date si reporté','DATE','Planning',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PAM-A'),'Observations','Observations','TEXTE','Observations',false,7,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-PVM-A','Liste de produits validés pour la maintenance','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PVM-A'),'Nom du produit de maintenance','Nom du produit de maintenance','TEXTE','Produit',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PVM-A'),'Fournisseurs','Fournisseurs','TEXTE','Produit',false,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PVM-A'),'Pour quelle machine ?','Pour quelle machine ?','TEXTE','Produit',false,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PVM-A'),'Mode d''''emploi','Mode d''''emploi','TEXTE','Produit',false,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PVM-A'),'Date de validation','Date de validation','DATE','Produit',false,5),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PVM-A'),'Visa','Visa','SIGNATURE','Validation',true,6);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-REM-A','Rapport journalier de maintenance','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Nom','Nom','TEXTE','Identification',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Problème non résolu','Problème non résolu','TEXTE','Rapport',false,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Points de surveillance','Points de surveillance','TEXTE','Rapport',false,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Enregistrements de maintenances préventives du jour effectuées','Enregistrements de maintenances préventives du jour effectuées','TEXTE','Rapport',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Nouvelle pièce de rechange utilisée','Nouvelle pièce de rechange utilisée','TEXTE','Rapport',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Cahier de sortie de stock renseigné','Cahier de sortie de stock renseigné','BOOLEEN','Rapport',true,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Présence de solvant en conditionnement (min 2L)','Présence de solvant en conditionnement (min 2L)','BOOLEEN','Rapport',true,8,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Outils de l''''armoire en conditionnement rangés et complets','Outils de l''''armoire en conditionnement rangés et complets','BOOLEEN','Rapport',true,9,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Documents d''''enregistrement des maintenances renseignées','Documents d''''enregistrement des maintenances renseignées','BOOLEEN','Rapport',true,10,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Réservoir de purge d''''eau compresseurs vide','Réservoir de purge d''''eau compresseurs vide','BOOLEEN','Rapport',true,11,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Nombre de carton PF et dernier N°','Nombre de carton PF et dernier N°','TEXTE','Rapport',false,12,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Observations','Observations','TEXTE','Rapport',false,13,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Quart 06h-14h — Nom','Quart 06h-14h — Nom','TEXTE','Passation de quart',false,14,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Quart 14h-22h — Nom','Quart 14h-22h — Nom','TEXTE','Passation de quart',false,15,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-REM-A'),'Quart 22h-06h — Nom','Quart 22h-06h — Nom','TEXTE','Passation de quart',false,16,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-SEL-A','Enregistrement de suivi Encre Leibinger','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SEL-A'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SEL-A'),'Entrées','Entrées','NOMBRE','Mouvement stock',false,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SEL-A'),'Sorties','Sorties','NOMBRE','Mouvement stock',false,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SEL-A'),'Quantité','Quantité','NOMBRE','Mouvement stock',false,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SEL-A'),'Stock final','Stock final','NOMBRE','Mouvement stock',true,5),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SEL-A'),'Visas','Visas','SIGNATURE','Validation',true,6);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-SOL-A','Enregistrement de suivi de Solvant','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SOL-A'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SOL-A'),'Entrées','Entrées','NOMBRE','Mouvement stock',false,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SOL-A'),'Sorties','Sorties','NOMBRE','Mouvement stock',false,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SOL-A'),'Quantité','Quantité','NOMBRE','Mouvement stock',false,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SOL-A'),'Stock final','Stock final','NOMBRE','Mouvement stock',true,5),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SOL-A'),'Visas','Visas','SIGNATURE','Validation',true,6);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-SPR-A','Enregistrement de Suivi manuel de sortie de pièces de rechange','MAINTENANCE','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SPR-A'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SPR-A'),'Semaine','Semaine','TEXTE','Identification',false,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SPR-A'),'Désignations','Désignations','TEXTE','Sortie',true,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SPR-A'),'Références','Références','TEXTE','Sortie',true,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SPR-A'),'Quantité','Quantité','NOMBRE','Sortie',true,5),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SPR-A'),'Destination','Destination','TEXTE','Sortie',false,6),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SPR-A'),'Observations','Observations','TEXTE','Sortie',false,7),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-SPR-A'),'Visa','Visa','SIGNATURE','Validation',true,8);

-- ================================================================
-- MAINTENANCE — MENSUELS (8 manquants sur 9)
-- ================================================================

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-ACC-A','Enregistrement mensuel Appoint d''eau des Circuits de Chauffe','MAINTENANCE','MENSUEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ACC-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ACC-A'),'Vase d''''expansion — FONDOIR','Vase d''''expansion — FONDOIR','LISTE','Remplissage',false,2,'["OK","Rempli","NA"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ACC-A'),'Vase d''''expansion — OPTINUT','Vase d''''expansion — OPTINUT','LISTE','Remplissage',false,3,'["OK","Rempli","NA"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ACC-A'),'Vase d''''expansion — CUVE ADDITIF','Vase d''''expansion — CUVE ADDITIF','LISTE','Remplissage',false,4,'["OK","Rempli","NA"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ACC-A'),'Vase d''''expansion — CUVE TAMPON','Vase d''''expansion — CUVE TAMPON','LISTE','Remplissage',false,5,'["OK","Rempli","NA"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ACC-A'),'Vase d''''expansion — 2NUT','Vase d''''expansion — 2NUT','LISTE','Remplissage',false,6,'["OK","Rempli","NA"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ACC-A'),'Vase d''''expansion — CUVE PF','Vase d''''expansion — CUVE PF','LISTE','Remplissage',false,7,'["OK","Rempli","NA"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ACC-A'),'Fonctionnement pompe','Fonctionnement pompe','LISTE','Pompe',true,8,'["OK","Défaut"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ACC-A'),'Observations','Observations','TEXTE','Observations',false,9,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-ACC-A'),'Visas','Visas','SIGNATURE','Validation',true,10,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-CBS-A','Enregistrement mensuel de Couronnes de Broyeur Stephan','MAINTENANCE','MENSUEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CBS-A'),'Date de contrôle','Date de contrôle','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CBS-A'),'Numéro Broyeur','Numéro Broyeur','TEXTE','Contrôle',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CBS-A'),'Présence de corps étrangers','Présence de corps étrangers','LISTE','Contrôle',true,3,'["Oui","Non"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CBS-A'),'Couteaux manquants','Couteaux manquants','LISTE','Contrôle',true,4,'["Oui","Non"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CBS-A'),'Couteaux usés','Couteaux usés','LISTE','Contrôle',true,5,'["Oui","Non"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CBS-A'),'Tous les critères OK (ou couronne à changer)','Tous les critères OK (ou couronne à changer)','TEXTE','Résultat',true,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CBS-A'),'Initiales','Initiales','SIGNATURE','Validation',true,7,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-CTM-A','Enregistrement mensuel de Contrôle du Temps de Mélange','MAINTENANCE','MENSUEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CTM-A'),'Date du contrôle','Date du contrôle','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CTM-A'),'Pré-mélangeur (60 s)','Pré-mélangeur (60 s)','NOMBRE','Contrôle temps',true,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CTM-A'),'Mélange Poudre (420 s)','Mélange Poudre (420 s)','NOMBRE','Contrôle temps',true,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CTM-A'),'Observations','Observations','TEXTE','Observations',false,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CTM-A'),'Signature','Signature','SIGNATURE','Validation',true,5);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-FPF-A','Enregistrement mensuelle du Filtre produit fini','MAINTENANCE','MENSUEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FPF-A'),'Dates','Dates','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FPF-A'),'Contrôle état du tamis','Contrôle état du tamis','LISTE','Contrôle filtre',true,2,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FPF-A'),'Contrôle état des joints','Contrôle état des joints','LISTE','Contrôle filtre',true,3,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FPF-A'),'Contrôle de la vanne de purge','Contrôle de la vanne de purge','LISTE','Contrôle filtre',true,4,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FPF-A'),'Fonctionnement du moteur','Fonctionnement du moteur','LISTE','Contrôle filtre',true,5,'["OK","Défaut"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FPF-A'),'Observations','Observations','TEXTE','Observations',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-FPF-A'),'Visas','Visas','SIGNATURE','Validation',true,7,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-LUV-A','Enregistrement mensuel d''Entretien des Lampes UV','MAINTENANCE','MENSUEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-LUV-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-LUV-A'),'Numéro lampe (01-30)','Numéro lampe (01-30)','TEXTE','Contrôle',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-LUV-A'),'Localisation','Localisation','TEXTE','Contrôle',true,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-LUV-A'),'Nettoyage insectocuteurs','Nettoyage insectocuteurs','LISTE','Contrôle',true,4,'["OK","Fait"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-LUV-A'),'Fonctionnement des lampes UV','Fonctionnement des lampes UV','LISTE','Contrôle',true,5,'["OK","Défaut"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-LUV-A'),'Observations (Ok/Problèmes)','Observations (Ok/Problèmes)','TEXTE','Observations',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-LUV-A'),'Réparation si nécessaire','Réparation si nécessaire','BOOLEEN','Actions',false,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-LUV-A'),'Signature','Signature','SIGNATURE','Validation',true,8,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MCO-A','Enregistrement mensuel de Maintenance des Convoyeurs','MAINTENANCE','MENSUEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCO-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCO-A'),'Désignation (convoyeur)','Désignation (convoyeur)','TEXTE','Contrôle',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCO-A'),'État du tapis — alignement','État du tapis — alignement','LISTE','Contrôle',true,3,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCO-A'),'État du tapis — usure','État du tapis — usure','LISTE','Contrôle',true,4,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCO-A'),'Graissage des roulements','Graissage des roulements','BOOLEEN','Contrôle',true,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCO-A'),'Observations','Observations','TEXTE','Observations',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MCO-A'),'Visas','Visas','SIGNATURE','Validation',true,7,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MEA-A','Enregistrement mensuel de Maintenance des Extracteurs d''Air','MAINTENANCE','MENSUEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEA-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEA-A'),'Extracteur (désignation)','Extracteur (désignation)','TEXTE','Contrôle',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEA-A'),'Nettoyage des pales','Nettoyage des pales','BOOLEEN','Contrôle',true,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEA-A'),'Nettoyage des volets','Nettoyage des volets','BOOLEEN','Contrôle',true,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEA-A'),'Fonctionnement global','Fonctionnement global','LISTE','Contrôle',true,5,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEA-A'),'Observations','Observations','TEXTE','Observations',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MEA-A'),'Visas','Visas','SIGNATURE','Validation',true,7,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MMC-A','Enregistrement de Maintenance mensuelle CTA','MAINTENANCE','MENSUEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MMC-A'),'Dates','Dates','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MMC-A'),'Vérification turbine moteur','Vérification turbine moteur','LISTE','Contrôle',true,2,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MMC-A'),'Vérification fuite au niveau de la batterie froide','Vérification fuite au niveau de la batterie froide','BOOLEEN','Contrôle',true,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MMC-A'),'Vérification présence moisissure au niveau batterie froide','Vérification présence moisissure au niveau batterie froide','BOOLEEN','Contrôle',false,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MMC-A'),'Nettoyage grille chambre froide (chaque 3 mois)','Nettoyage grille chambre froide (chaque 3 mois)','BOOLEEN','Contrôle',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MMC-A'),'Remplacement des filtres G4 usine et air neuf (chaque 3 mois)','Remplacement des filtres G4 usine et air neuf (chaque 3 mois)','BOOLEEN','Entretien',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MMC-A'),'Observations','Observations','TEXTE','Observations',false,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MMC-A'),'Visas','Visas','SIGNATURE','Validation',true,8,NULL);

-- ================================================================
-- MAINTENANCE — TRIMESTRIELS (2 manquants)
-- ================================================================

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-CRC-A','Enregistrement Trimestriel de Contrôle des Résistances Chauffantes Triphasées','MAINTENANCE','TRIMESTRIEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRC-A'),'Dates','Dates','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRC-A'),'Vase d''''expension (équipement)','Vase d''''expension (équipement)','TEXTE','Contrôle résistances',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRC-A'),'Nombre de résistances contrôlées','Nombre de résistances contrôlées','NOMBRE','Contrôle résistances',true,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRC-A'),'Tension mesurée (V)','Tension mesurée (V)','NOMBRE','Contrôle résistances',true,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRC-A'),'Fonctionnement','Fonctionnement','LISTE','Contrôle résistances',true,5,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRC-A'),'Observations','Observations','TEXTE','Observations',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRC-A'),'Visas','Visas','SIGNATURE','Validation',true,7,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MPO-A','Enregistrement de Maintenance trimestrielle des Pompes','MAINTENANCE','TRIMESTRIEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPO-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPO-A'),'Pompe SPX Thermisation — en marche','Pompe SPX Thermisation — en marche','LISTE','Pompe SPX Thermisation',true,2,'["Oui","Non"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPO-A'),'Pompe SPX Thermisation — fuites-tresses','Pompe SPX Thermisation — fuites-tresses','LISTE','Pompe SPX Thermisation',true,3,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPO-A'),'Pompe SPX Thermisation — anomalies détectées','Pompe SPX Thermisation — anomalies détectées','TEXTE','Pompe SPX Thermisation',false,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPO-A'),'Pompe SPX MP — en marche','Pompe SPX MP — en marche','LISTE','Pompe SPX MP',true,5,'["Oui","Non"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPO-A'),'Pompe SPX MP — fuites-tresses','Pompe SPX MP — fuites-tresses','LISTE','Pompe SPX MP',true,6,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPO-A'),'Pompe MOUVEX — en marche','Pompe MOUVEX — en marche','LISTE','Pompe MOUVEX',true,7,'["Oui","Non"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPO-A'),'Pompe MOUVEX — fuites-tresses','Pompe MOUVEX — fuites-tresses','LISTE','Pompe MOUVEX',true,8,'["OK","Anomalie"]'),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPO-A'),'Actions prévues','Actions prévues','TEXTE','Actions',false,9,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPO-A'),'Actions réalisées','Actions réalisées','TEXTE','Actions',false,10,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MPO-A'),'Visas','Visas','SIGNATURE','Validation',true,11,NULL);

-- ================================================================
-- MAINTENANCE — SEMESTRIELS ET ANNUELS (6 manquants)
-- ================================================================

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-CAA-A','Enregistrement annuel de maintenance Compresseur à Air','MAINTENANCE','ANNUEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CAA-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CAA-A'),'N° Compresseur','N° Compresseur','TEXTE','Identification',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CAA-A'),'Heures de fonctionnement','Heures de fonctionnement','NOMBRE','Relevés',true,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CAA-A'),'Pièces remplacées','Pièces remplacées','TEXTE','Intervention',false,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CAA-A'),'Contrôler les fuites des tuyaux et raccords','Contrôler les fuites des tuyaux et raccords','BOOLEEN','Contrôle',true,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CAA-A'),'Observation','Observation','TEXTE','Observations',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CAA-A'),'Réparation si nécessaire','Réparation si nécessaire','BOOLEEN','Actions',false,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CAA-A'),'Signature','Signature','SIGNATURE','Validation',true,8,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-CRD-A','Enregistrement semestriel de Contrôle et Réaffûtage des dents de Broyeur','MAINTENANCE','SEMESTRIEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRD-A'),'Dates','Dates','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRD-A'),'Broyeur (01, 02, 03)','Broyeur (01, 02, 03)','TEXTE','Contrôle',true,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRD-A'),'Nombre de dents usées','Nombre de dents usées','NOMBRE','Contrôle',true,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRD-A'),'Nombre de dents réaffûtées','Nombre de dents réaffûtées','NOMBRE','Contrôle',true,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRD-A'),'Observations','Observations','TEXTE','Observations',false,5),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CRD-A'),'Visas','Visas','SIGNATURE','Validation',true,6);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-CST-A','Enregistrement biannuel de Contrôle des Sondes de Température','MAINTENANCE','SEMESTRIEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CST-A'),'Zone / Équipement','Zone / Équipement','TEXTE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CST-A'),'T° sonde eau','T° sonde eau','NOMBRE','Contrôle',true,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CST-A'),'T° témoin','T° témoin','NOMBRE','Contrôle',true,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CST-A'),'T° sonde produit','T° sonde produit','NOMBRE','Contrôle',false,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CST-A'),'Différence','Différence','NOMBRE','Contrôle',false,5),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-CST-A'),'Commentaire','Commentaire','TEXTE','Observations',false,6);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-EGA-A','Enregistrement annuel du Générateur d''Azote','MAINTENANCE','ANNUEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-EGA-A'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-EGA-A'),'Pièces changées','Pièces changées','TEXTE','Intervention',true,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-EGA-A'),'Observations','Observations','TEXTE','Observations',false,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-EGA-A'),'Visas','Visas','SIGNATURE','Validation',true,4);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-MSC-A','Enregistrement de Maintenance Semestrielle CTA','MAINTENANCE','SEMESTRIEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MSC-A'),'Dates','Dates','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MSC-A'),'Remplacement de Filtre M6','Remplacement de Filtre M6','BOOLEEN','Remplacement filtres',true,2),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MSC-A'),'Remplacement de Filtre E6','Remplacement de Filtre E6','BOOLEEN','Remplacement filtres',true,3),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MSC-A'),'Observations','Observations','TEXTE','Observations',false,4),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-MSC-A'),'Visas','Visas','SIGNATURE','Validation',true,5);

-- PS-ME-EN-PAM-A (semestriel/annuel) — version semestrielle distincte
INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PS-ME-EN-PAM-S','Planning des activités de maintenance préventive (semestriel/annuel)','MAINTENANCE','SEMESTRIEL')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PAM-S'),'Mois (Janvier à Décembre)','Mois (Janvier à Décembre)','TEXTE','Planning annuel',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PAM-S'),'Activités planifiées','Activités planifiées','TEXTE','Planning annuel',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PS-ME-EN-PAM-S'),'Statut','Statut','LISTE','Planning annuel',false,3,'["Planifié","Réalisé","Reporté"]');

-- ================================================================
-- PRODUCTION — AU BESOIN (2 manquants sur 5)
-- ================================================================

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PO-AP-EN-DLD-B','Demande de libération par dérogation MP','PRODUCTION','AU_BESOIN')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Besoin de la production — Matière Première','Besoin de la production — Matière Première','TEXTE','Logistique/Production',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Fournisseur (nom, adresse)','Fournisseur (nom, adresse)','TEXTE','Logistique/Production',false,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Fabriquant (nom, adresse)','Fabriquant (nom, adresse)','TEXTE','Logistique/Production',false,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Numéro lot fournisseur','Numéro lot fournisseur','TEXTE','Logistique/Production',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'N° lot interne','N° lot interne','TEXTE','Logistique/Production',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Taille du lot','Taille du lot','NOMBRE','Logistique/Production',false,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Date de fabrication','Date de fabrication','DATE','Logistique/Production',false,8,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'DLUO','DLUO','DATE','Logistique/Production',false,9,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Contrôle réception — Résultat disponible (oui/non)','Contrôle réception — Résultat disponible (oui/non)','BOOLEEN','Contrôle Qualité',false,10,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Emballage','Emballage','LISTE','Contrôle Qualité',false,11,'["Conforme","Non conforme"]'),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Analyse physico-chimique','Analyse physico-chimique','LISTE','Contrôle Qualité',false,12,'["Conforme","Non conforme","En cours"]'),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Analyse microbiologique','Analyse microbiologique','LISTE','Contrôle Qualité',false,13,'["Conforme","Non conforme","En cours"]'),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Commentaire','Commentaire','TEXTE','Contrôle Qualité',false,14,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Libération par dérogation (oui/non)','Libération par dérogation (oui/non)','BOOLEEN','Direction',true,15,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-DLD-B'),'Signature Direction','Signature Direction','SIGNATURE','Direction',true,16,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PO-AP-EN-PNP-F','Enregistrement de la pousse lors du nettoyage profond','PRODUCTION','AU_BESOIN')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PNP-F'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PNP-F'),'Désinfection des surfaces','Désinfection des surfaces','BOOLEEN','Pousse',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PNP-F'),'Pousse de produit PO-AP-EN-PNP réalisée','Pousse de produit PO-AP-EN-PNP réalisée','BOOLEEN','Pousse',true,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PNP-F'),'Résultats satisfaisants','Résultats satisfaisants','LISTE','Pousse',true,4,'["Oui","Non","En attente"]'),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PNP-F'),'Observations','Observations','TEXTE','Observations',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PNP-F'),'Signature','Signature','SIGNATURE','Validation',true,6,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PO-QS-EN-DCP-B','Demande de Changement de Produit','PRODUCTION','AU_BESOIN')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Motifs du changement de produit','Motifs du changement de produit','TEXTE','Demande',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Produit A (précédent)','Produit A (précédent)','TEXTE','Types de produits',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Produit B (nouveau)','Produit B (nouveau)','TEXTE','Types de produits',true,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Date de production du produit B souhaitée','Date de production du produit B souhaitée','DATE','Types de produits',true,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Nettoyage profond réalisé','Nettoyage profond réalisé','BOOLEEN','Opérations réalisées',true,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'EN Changement de produit suivi','EN Changement de produit suivi','BOOLEEN','Opérations réalisées',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Matières premières exclusives produit A évacuées','Matières premières exclusives produit A évacuées','BOOLEEN','Opérations réalisées',true,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Emballages exclusifs produit A évacués','Emballages exclusifs produit A évacués','BOOLEEN','Opérations réalisées',true,8,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Enregistrements produit A évacués','Enregistrements produit A évacués','BOOLEEN','Opérations réalisées',true,9,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Origyn configuré pour le produit B','Origyn configuré pour le produit B','BOOLEEN','Contrôles effectués',false,10,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Contrôle environnement réalisé — résultats satisfaisants','Contrôle environnement réalisé — résultats satisfaisants','BOOLEEN','Contrôles effectués',false,11,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Contrôle de la pousse réalisé — résultats satisfaisants','Contrôle de la pousse réalisé — résultats satisfaisants','BOOLEEN','Contrôles effectués',false,12,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Décision','Décision','TEXTE','Décision',true,13,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Signature Département Production','Signature Département Production','SIGNATURE','Signatures',true,14,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-QS-EN-DCP-B'),'Signature Département Qualité','Signature Département Qualité','SIGNATURE','Signatures',true,15,NULL);

-- ================================================================
-- PRODUCTION — HEBDOMADAIRES (5 manquants)
-- ================================================================

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PO-AP-EN-PDP-B','Planning de production','PRODUCTION','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PDP-B'),'Mois','Mois','TEXTE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PDP-B'),'Objectif de production','Objectif de production','TEXTE','Planning',true,2),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PDP-B'),'Qté à produire en Kg','Qté à produire en Kg','NOMBRE','Planning',true,3),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PDP-B'),'Nbre de quart estimé','Nbre de quart estimé','NOMBRE','Planning',false,4),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PDP-B'),'Qté produite en Mg et carton','Qté produite en Mg et carton','NOMBRE','Réalisé',false,5),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PDP-B'),'Nbre de quart réel','Nbre de quart réel','NOMBRE','Réalisé',false,6),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PDP-B'),'Taux de Production','Taux de Production','NOMBRE','Réalisé',false,7),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PDP-B'),'Productivité 60%','Productivité 60%','NOMBRE','Réalisé',false,8);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PO-AP-EN-PFP-A','Planning de formation du personnel de production','PRODUCTION','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PFP-A'),'Activités à planifier','Activités à planifier','TEXTE','Planning',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PFP-A'),'Période début','Période début','DATE','Planning',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PFP-A'),'Période fin','Période fin','DATE','Planning',false,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PFP-A'),'Report Oui/Non','Report Oui/Non','BOOLEEN','Planning',false,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PFP-A'),'Nouvelle date si reporté','Nouvelle date si reporté','DATE','Planning',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PFP-A'),'Observations','Observations','TEXTE','Observations',false,6,NULL);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PO-AP-EN-PPH-B','Prévision de production hebdomadaire','PRODUCTION','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-B'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-B'),'Shift','Shift','LISTE','Planning semaine',true,2),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-B'),'Dernier numéro de carton par quart — Prévisions','Dernier numéro de carton par quart — Prévisions','NOMBRE','Suivi carton',false,3),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-B'),'Dernier numéro de carton par quart — Actuel','Dernier numéro de carton par quart — Actuel','NOMBRE','Suivi carton',false,4),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-B'),'Dernier numéro de carton par jour — Prévisions','Dernier numéro de carton par jour — Prévisions','NOMBRE','Suivi carton',false,5),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-B'),'Dernier numéro de carton par jour — Actuel','Dernier numéro de carton par jour — Actuel','NOMBRE','Suivi carton',false,6),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-B'),'Différence par jour (+/-)','Différence par jour (+/-)','NOMBRE','Suivi carton',false,7),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-B'),'Prime exceptionnelle (Double de la prime)','Prime exceptionnelle (Double de la prime)','BOOLEEN','Prime',false,8);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PO-AP-EN-PPH-PDP-PDMPFP-B','Planning consolidé (production, équipes, maintenance, formation)','PRODUCTION','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-PDP-PDMPFP-B'),'Semaine','Semaine','TEXTE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-PDP-PDMPFP-B'),'Planning de production','Planning de production','TEXTE','Consolidation',false,2),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-PDP-PDMPFP-B'),'Planning des équipes','Planning des équipes','TEXTE','Consolidation',false,3),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-PDP-PDMPFP-B'),'Planning maintenance','Planning maintenance','TEXTE','Consolidation',false,4),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-PDP-PDMPFP-B'),'Planning formation','Planning formation','TEXTE','Consolidation',false,5),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPH-PDP-PDMPFP-B'),'Observations','Observations','TEXTE','Consolidation',false,6);

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PO-AP-EN-PPM-B','Planning des équipes de production et de maintenance','PRODUCTION','HEBDO')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPM-B'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPM-B'),'Shift (06h-14h / 14h-22h / 22h-06h)','Shift (06h-14h / 14h-22h / 22h-06h)','LISTE','Planning',true,2,'["06h-14h","14h-22h","22h-06h"]'),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPM-B'),'Équipe affectée','Équipe affectée','TEXTE','Planning',true,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-PPM-B'),'Observations','Observations','TEXTE','Planning',false,4,NULL);

-- ================================================================
-- PRODUCTION — JOURNALIERS (1 manquant : PO-AP-EN-CDP-A)
-- ================================================================

INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PO-AP-EN-CDP-A','Cahier de passation chef de quart (version A)','PRODUCTION','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre, options_liste) VALUES
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Date','Date','DATE','Identification',true,1,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Semaine','Semaine','TEXTE','Identification',true,2,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Nom du CQ — QUART 1','Nom du CQ — QUART 1','TEXTE','Passation quarts',true,3,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Heure — QUART 1','Heure — QUART 1','HEURE','Passation quarts',true,4,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Nom du CQ — QUART 2','Nom du CQ — QUART 2','TEXTE','Passation quarts',false,5,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Heure — QUART 2','Heure — QUART 2','HEURE','Passation quarts',false,6,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Nom du CQ — QUART 3','Nom du CQ — QUART 3','TEXTE','Passation quarts',false,7,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Heure — QUART 3','Heure — QUART 3','HEURE','Passation quarts',false,8,NULL),
-- Atelier Pesée-Incorporation poudres (Mélange)
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Nb de mélanges confirmés sur Origyn','Nb de mélanges confirmés sur Origyn','NOMBRE','Atelier Pesée-Incorporation',false,9,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Les matières déjà pesées','Les matières déjà pesées','NOMBRE','Atelier Pesée-Incorporation',false,10,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Bouchons — Laquelle ? Réglée ?','Bouchons — Laquelle ? Réglée ?','TEXTE','Atelier Pesée-Incorporation',false,11,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Nb de prémélanges','Nb de prémélanges','NOMBRE','Atelier Pesée-Incorporation',false,12,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Nb de prémélanges confirmés sur Origyn','Nb de prémélanges confirmés sur Origyn','NOMBRE','Atelier Pesée-Incorporation',false,13,NULL),
-- Atelier Thermisation-Prémélange
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Bouchons Thermisation — Laquelle ? Réglée ?','Bouchons Thermisation — Laquelle ? Réglée ?','TEXTE','Atelier Thermisation-Prémélange',false,14,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Quantité d''''huile salée (huile récupérée)','Quantité d''''huile salée (huile récupérée)','NOMBRE','Atelier Thermisation-Prémélange',false,15,NULL),
-- Atelier Conditionnement
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Nombre de Cartons','Nombre de Cartons','NOMBRE','Atelier Conditionnement',false,16,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Numéro du dernier Carton','Numéro du dernier Carton','TEXTE','Atelier Conditionnement',false,17,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Nombre de sachet mal imprimé','Nombre de sachet mal imprimé','NOMBRE','Atelier Conditionnement',false,18,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Nombre de Pallettes déclarées sur Origyn','Nombre de Pallettes déclarées sur Origyn','NOMBRE','Atelier Conditionnement',false,19,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Pertes produits finis (en kG)','Pertes produits finis (en kG)','NOMBRE','Atelier Conditionnement',false,20,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Pertes sachets plastiques','Pertes sachets plastiques','NOMBRE','Atelier Conditionnement',false,21,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Pertes Cartons vides','Pertes Cartons vides','NOMBRE','Atelier Conditionnement',false,22,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Prélèvements déposés au Labo','Prélèvements déposés au Labo','BOOLEEN','Atelier Conditionnement',false,23,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Problème Machine — Laquelle ? Réglée ?','Problème Machine — Laquelle ? Réglée ?','TEXTE','Atelier Conditionnement',false,24,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Remplissage fiches vérifiées','Remplissage fiches vérifiées','BOOLEEN','Atelier Conditionnement',false,25,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Commentaires','Commentaires','TEXTE','Fin du quart',false,26,NULL),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-CDP-A'),'Signature chef de quart','Signature chef de quart','SIGNATURE','Fin du quart',true,27,NULL);

-- PO-AP-EN-SPM-B (Suivi des pertes de matières premières) - déjà peut-être absent
INSERT INTO formulaires_types (code, titre, module, frequence) VALUES
('PO-AP-EN-SPM-B','Suivi des pertes de matières premières','PRODUCTION','JOURNALIER')
ON CONFLICT (code) DO NOTHING;
INSERT INTO champs_definitions (formulaire_type_id, nom_champ, label, type_champ, section, obligatoire, ordre) VALUES
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Date','Date','DATE','Identification',true,1),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Produit en Kg — PF et PSF','Produit en Kg — PF et PSF','NOMBRE','Produit',false,2),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Emballage en Kg — Carton et Sache','Emballage en Kg — Carton et Sache','NOMBRE','Emballage',false,3),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Besoin en MP — Huile de Palme (18,06%)','Besoin en MP — Huile de Palme (18,06%)','NOMBRE','Matières premières',false,4),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Besoin en MP — Huile de Colza (5,53%)','Besoin en MP — Huile de Colza (5,53%)','NOMBRE','Matières premières',false,5),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Besoin en MP — Arachide (23,4%)','Besoin en MP — Arachide (23,4%)','NOMBRE','Matières premières',false,6),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Besoin en MP — Sucre (24,34%)','Besoin en MP — Sucre (24,34%)','NOMBRE','Matières premières',false,7),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Besoin en MP — Nota S (1,02%)','Besoin en MP — Nota S (1,02%)','NOMBRE','Matières premières',false,8),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Besoin en MP — Lait (17,8%)','Besoin en MP — Lait (17,8%)','NOMBRE','Matières premières',false,9),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Besoin en MP — Lacto (12,13%)','Besoin en MP — Lacto (12,13%)','NOMBRE','Matières premières',false,10),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Besoin en MP — Prémix (1,71%)','Besoin en MP — Prémix (1,71%)','NOMBRE','Matières premières',false,11),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Besoin en MP — Farine de Cacao (9,39%)','Besoin en MP — Farine de Cacao (9,39%)','NOMBRE','Matières premières',false,12),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Complexe PNUT','Complexe PNUT','NOMBRE','Emballages',false,13),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Complexe PLUP','Complexe PLUP','NOMBRE','Emballages',false,14),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Complexe Grand Bleu','Complexe Grand Bleu','NOMBRE','Emballages',false,15),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Sachets','Sachets','NOMBRE','Emballages',false,16),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Cartons','Cartons','NOMBRE','Emballages',false,17),
((SELECT id FROM formulaires_types WHERE code='PO-AP-EN-SPM-B'),'Scotch','Scotch','NOMBRE','Emballages',false,18);

-- ================================================================
-- DONNÉES DE DÉMO pour la présentation
-- ================================================================

-- Quelques soumissions de demo (technicien)
INSERT INTO soumissions (id, formulaire_type_id, utilisateur_id, equipement_id, statut, source, date_soumission)
SELECT
  gen_random_uuid(),
  ft.id,
  u.id,
  e.id,
  'SOUMIS',
  'EN_LIGNE',
  NOW() - INTERVAL '1 day'
FROM formulaires_types ft, utilisateurs u, equipements e
WHERE ft.code = 'PS-ME-EN-CAQ-A'
  AND u.email = 'seydou.kabore@innofaso.com'
  AND e.code_ref = 'COMP-AIR-01'
LIMIT 1;

INSERT INTO soumissions (id, formulaire_type_id, utilisateur_id, equipement_id, statut, source, date_soumission)
SELECT
  gen_random_uuid(),
  ft.id,
  u.id,
  e.id,
  'SOUMIS',
  'EN_LIGNE',
  NOW() - INTERVAL '2 hours'
FROM formulaires_types ft, utilisateurs u, equipements e
WHERE ft.code = 'PS-ME-EN-MCP-A'
  AND u.email = 'seydou.kabore@innofaso.com'
  AND e.code_ref = 'BROYEUR-01'
LIMIT 1;

INSERT INTO soumissions (id, formulaire_type_id, utilisateur_id, equipement_id, statut, source, date_soumission)
SELECT
  gen_random_uuid(),
  ft.id,
  u.id,
  e.id,
  'SOUMIS',
  'EN_LIGNE',
  NOW() - INTERVAL '3 days'
FROM formulaires_types ft, utilisateurs u, equipements e
WHERE ft.code = 'PS-ME-EN-EHG-A'
  AND u.email = 'seydou.kabore@innofaso.com'
  AND e.code_ref = 'GE-275KVA'
LIMIT 1;

INSERT INTO soumissions (id, formulaire_type_id, utilisateur_id, equipement_id, statut, source, date_soumission)
SELECT
  gen_random_uuid(),
  ft.id,
  u.id,
  e.id,
  'SOUMIS',
  'EN_LIGNE',
  NOW() - INTERVAL '5 days'
FROM formulaires_types ft, utilisateurs u, equipements e
WHERE ft.code = 'PS-ME-EN-REM-A'
  AND u.email = 'seydou.kabore@innofaso.com'
  AND e.code_ref = 'BROYEUR-01'
LIMIT 1;

-- Soumissions production (responsable)
INSERT INTO soumissions (id, formulaire_type_id, utilisateur_id, equipement_id, statut, source, date_soumission)
SELECT
  gen_random_uuid(),
  ft.id,
  u.id,
  NULL,
  'SOUMIS',
  'EN_LIGNE',
  NOW() - INTERVAL '1 day'
FROM formulaires_types ft, utilisateurs u
WHERE ft.code = 'PO-AP-EN-CDP-B'
  AND u.email = 'moussa.ouedraogo@innofaso.com'
LIMIT 1;

INSERT INTO soumissions (id, formulaire_type_id, utilisateur_id, equipement_id, statut, source, date_soumission)
SELECT
  gen_random_uuid(),
  ft.id,
  u.id,
  NULL,
  'SOUMIS',
  'EN_LIGNE',
  NOW() - INTERVAL '6 hours'
FROM formulaires_types ft, utilisateurs u
WHERE ft.code = 'PO-AP-EN-IGD-A'
  AND u.email = 'moussa.ouedraogo@innofaso.com'
LIMIT 1;

INSERT INTO soumissions (id, formulaire_type_id, utilisateur_id, equipement_id, statut, source, date_soumission)
SELECT
  gen_random_uuid(),
  ft.id,
  u.id,
  NULL,
  'SOUMIS',
  'EN_LIGNE',
  NOW() - INTERVAL '2 days'
FROM formulaires_types ft, utilisateurs u
WHERE ft.code = 'PO-AP-EN-PPM-B'
  AND u.email = 'moussa.ouedraogo@innofaso.com'
LIMIT 1;

-- Quelques alertes de demo
INSERT INTO alertes (id, utilisateur_id, type_alerte, message, statut, date_creation)
SELECT gen_random_uuid(), u.id, 'FORMULAIRE_EN_RETARD',
  'Le formulaire PS-ME-EN-CAQ-A est en retard de 2 jours', 'NON_LUE', NOW() - INTERVAL '2 days'
FROM utilisateurs u WHERE u.email = 'seydou.kabore@innofaso.com';

INSERT INTO alertes (id, utilisateur_id, equipement_id, type_alerte, message, statut, date_creation)
SELECT gen_random_uuid(), u.id, e.id, 'PANNE_CRITIQUE',
  'Panne signalée sur BROYEUR-01 — intervention requise', 'NON_LUE', NOW() - INTERVAL '3 hours'
FROM utilisateurs u, equipements e
WHERE u.email = 'seydou.kabore@innofaso.com' AND e.code_ref = 'BROYEUR-01';

INSERT INTO alertes (id, utilisateur_id, type_alerte, message, statut, date_creation)
SELECT gen_random_uuid(), u.id, 'FORMULAIRE_EN_RETARD',
  'Cahier de passation de quart non soumis ce jour', 'NON_LUE', NOW() - INTERVAL '4 hours'
FROM utilisateurs u WHERE u.email = 'moussa.ouedraogo@innofaso.com';

-- Planning de demo pour ce mois
INSERT INTO plannings_maintenance (id, formulaire_type_id, equipement_id, technicien_id, date_prevue, statut, commentaire)
SELECT gen_random_uuid(), ft.id, e.id, u.id, CURRENT_DATE + 1, 'PLANIFIE', 'Maintenance hebdomadaire GE'
FROM formulaires_types ft, equipements e, utilisateurs u
WHERE ft.code = 'PS-ME-EN-EHG-A' AND e.code_ref = 'GE-275KVA' AND u.email = 'seydou.kabore@innofaso.com';

INSERT INTO plannings_maintenance (id, formulaire_type_id, equipement_id, technicien_id, date_prevue, statut, commentaire)
SELECT gen_random_uuid(), ft.id, e.id, u.id, CURRENT_DATE + 3, 'PLANIFIE', 'Contrôle mensuel broyeur'
FROM formulaires_types ft, equipements e, utilisateurs u
WHERE ft.code = 'PS-ME-EN-MBR-A' AND e.code_ref = 'BROYEUR-01' AND u.email = 'seydou.kabore@innofaso.com';

INSERT INTO plannings_maintenance (id, formulaire_type_id, equipement_id, technicien_id, date_prevue, statut, commentaire)
SELECT gen_random_uuid(), ft.id, e.id, u.id, CURRENT_DATE - 2, 'REALISE', 'Fait le ' || (CURRENT_DATE - 2)::text
FROM formulaires_types ft, equipements e, utilisateurs u
WHERE ft.code = 'PS-ME-EN-CAQ-A' AND e.code_ref = 'COMP-AIR-01' AND u.email = 'seydou.kabore@innofaso.com';

SELECT 'Seed complet — ' || COUNT(*) || ' formulaires en base' AS resultat FROM formulaires_types;