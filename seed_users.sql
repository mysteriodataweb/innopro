-- ================================================================
-- INNOFASO v2 — Script de création des utilisateurs de test
-- ================================================================
-- Le mot de passe pour TOUS les comptes : Test123!
-- Hash bcrypt (salt 12) de "Test123!" :
-- $2a$12$Kes.9xP8KZJt7AJzWJfRiuL8XmkNthTKBbQMhMlO5iJ.oGT.KFWV6
-- ================================================================

-- ⚠️ Exécuter d'abord dans le terminal :
--   cd backend
--   node -e "const b=require('bcryptjs');b.hash('Test123!',12).then(h=>console.log(h));"
-- Puis remplacer HASH_ICI par le résultat

DO $$
DECLARE
  hash TEXT := '$2a$12$Kes.9xP8KZJt7AJzWJfRiuL8XmkNthTKBbQMhMlO5iJ.oGT.KFWV6';
  r_admin UUID;
  r_resp  UUID;
  r_tech  UUID;
  r_oper  UUID;
  r_lect  UUID;
BEGIN
  SELECT id INTO r_admin FROM role WHERE nom = 'Admin';
  SELECT id INTO r_resp  FROM role WHERE nom = 'Responsable';
  SELECT id INTO r_tech  FROM role WHERE nom = 'Technicien';
  SELECT id INTO r_oper  FROM role WHERE nom = 'Operateur';
  SELECT id INTO r_lect  FROM role WHERE nom = 'Lecteur';

  INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role_id) VALUES
    (gen_random_uuid(), 'COULIBALY',   'Omar',    'admin@innofaso.bf',        hash, r_admin),
    (gen_random_uuid(), 'COMPAORE',    'Thierry',  'responsable@innofaso.bf', hash, r_resp),
    (gen_random_uuid(), 'DABIRE',      'Clarisse', 'technicien@innofaso.bf',  hash, r_tech),
    (gen_random_uuid(), 'SAWADOGO',    'Salif',    'operateur@innofaso.bf',   hash, r_oper),
    (gen_random_uuid(), 'BONKOUNGOU',  'Aline',    'lecteur@innofaso.bf',     hash, r_lect)
  ON CONFLICT (email) DO NOTHING;

  RAISE NOTICE '✅ 5 utilisateurs créés avec le mot de passe : Test123!';
END $$;

-- Quelques équipements de test
INSERT INTO equipement (id, code_ref, nom, type_equipement, localisation, ligne_production) VALUES
  (gen_random_uuid(), 'COMP-AIR-01',  'Compresseur d''Air 1',          'Compresseur',    'Salle des machines',   'Ligne principale'),
  (gen_random_uuid(), 'BROYEUR-01',   'Broyeur Optinut 1',             'Broyeur',        'Atelier Thermisation', 'Ligne 1'),
  (gen_random_uuid(), 'BROYEUR-02',   'Broyeur Optinut 2',             'Broyeur',        'Atelier Thermisation', 'Ligne 2'),
  (gen_random_uuid(), 'BROYEUR-03',   'Broyeur 2Nut',                  'Broyeur',        'Atelier Thermisation', 'Ligne 3'),
  (gen_random_uuid(), 'GE-275KVA',    'Groupe Électrogène 275 Kva',    'Électrogène',    'Groupe électrogène',   NULL),
  (gen_random_uuid(), 'CUVE-TAMPON',  'Cuve Tampon Prémélange',        'Cuve',           'Atelier Thermisation', 'Ligne 1'),
  (gen_random_uuid(), 'CUVE-PF-600L', 'Cuve Produit Fini 600L',        'Cuve',           'Conditionnement',      'Ligne 1'),
  (gen_random_uuid(), 'CONV-HL-01',   'Convoyeur Horizontal Ligne 1',  'Convoyeur',      'Conditionnement',      'Ligne 1'),
  (gen_random_uuid(), 'FONDOIR-01',   'Fondoir à Huile',               'Fondoir',        'Atelier Thermisation', 'Ligne principale'),
  (gen_random_uuid(), 'DOSEUSE-NOVA', 'Doseuse Nova',                  'Doseuse',        'Conditionnement',      'Ligne 1')
ON CONFLICT (code_ref) DO NOTHING;

-- Quelques pièces de rechange de test
INSERT INTO piece_rechange (id, equipement_id, reference, designation, quantite_stock, seuil_alerte, unite) VALUES
  (gen_random_uuid(), (SELECT id FROM equipement WHERE code_ref='BROYEUR-01'), 'DENT-OPT-STD', 'Dents broyeur Optinut standard', 24, 6, 'pièce'),
  (gen_random_uuid(), (SELECT id FROM equipement WHERE code_ref='BROYEUR-01'), 'JOINT-AXE-01', 'Joint à lèvre axe broyeur Ø40', 4, 2, 'pièce'),
  (gen_random_uuid(), (SELECT id FROM equipement WHERE code_ref='COMP-AIR-01'), 'FILTRE-AIR-M', 'Filtre air compresseur M6', 6, 2, 'pièce'),
  (gen_random_uuid(), (SELECT id FROM equipement WHERE code_ref='COMP-AIR-01'), 'HUILE-COMP-5L', 'Huile compresseur 5L', 10, 3, 'bidon'),
  (gen_random_uuid(), (SELECT id FROM equipement WHERE code_ref='GE-275KVA'),   'FILTRE-GE-01', 'Filtre à carburant GE 275Kva', 3, 1, 'pièce'),
  (gen_random_uuid(), (SELECT id FROM equipement WHERE code_ref='CONV-HL-01'),  'COURROIE-HL1', 'Courroie convoyeur HL1', 2, 1, 'pièce')
ON CONFLICT (reference) DO NOTHING;

SELECT 'Seed terminé ! 🎉' AS message;
