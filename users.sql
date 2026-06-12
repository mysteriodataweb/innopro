-- ================================================================
-- SEED UTILISATEURS — tous les rôles
-- Mot de passe commun : InnoFaso2026!
-- ================================================================

-- Récupérer les IDs des rôles
DO $$
DECLARE
  id_admin      UUID;
  id_resp_maint UUID;
  id_resp_prod  UUID;
  id_technicien UUID;
  id_operateur  UUID;
  id_lecteur    UUID;
  hash_pass     TEXT := '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uEPy8prW2';
  -- Ce hash correspond à : InnoFaso2026!
  -- Généré avec bcrypt rounds=12
BEGIN

  SELECT id INTO id_admin      FROM roles WHERE nom = 'ADMIN';
  SELECT id INTO id_resp_maint FROM roles WHERE nom = 'RESP_MAINT';
  SELECT id INTO id_resp_prod  FROM roles WHERE nom = 'RESP_PROD';
  SELECT id INTO id_technicien FROM roles WHERE nom = 'TECHNICIEN';
  SELECT id INTO id_operateur  FROM roles WHERE nom = 'OPERATEUR';
  SELECT id INTO id_lecteur    FROM roles WHERE nom = 'LECTEUR';

  -- ── RESPONSABLES MAINTENANCE ───────────────────────────────────
  INSERT INTO utilisateurs (role_id, nom, prenom, email, mot_de_passe)
  VALUES
    (id_resp_maint, 'Ouédraogo', 'Moussa',   'moussa.ouedraogo@innofaso.com',  hash_pass),
    (id_resp_maint, 'Compaoré',  'Aminata',  'aminata.compaore@innofaso.com',  hash_pass)
  ON CONFLICT (email) DO NOTHING;

  -- ── RESPONSABLES PRODUCTION ────────────────────────────────────
  INSERT INTO utilisateurs (role_id, nom, prenom, email, mot_de_passe)
  VALUES
    (id_resp_prod, 'Sawadogo', 'Ibrahim',  'ibrahim.sawadogo@innofaso.com',  hash_pass),
    (id_resp_prod, 'Traoré',   'Fatoumata','fatoumata.traore@innofaso.com',  hash_pass)
  ON CONFLICT (email) DO NOTHING;

  -- ── TECHNICIENS MAINTENANCE ────────────────────────────────────
  INSERT INTO utilisateurs (role_id, nom, prenom, email, mot_de_passe)
  VALUES
    (id_technicien, 'Kaboré',   'Seydou',   'seydou.kabore@innofaso.com',    hash_pass),
    (id_technicien, 'Zongo',    'Adama',    'adama.zongo@innofaso.com',      hash_pass),
    (id_technicien, 'Ouédraogo','Boureima', 'boureima.ouedraogo@innofaso.com',hash_pass)
  ON CONFLICT (email) DO NOTHING;

  -- ── OPÉRATEURS PRODUCTION ──────────────────────────────────────
  INSERT INTO utilisateurs (role_id, nom, prenom, email, mot_de_passe)
  VALUES
    (id_operateur, 'Nikiéma',  'Mariam',   'mariam.nikiema@innofaso.com',   hash_pass),
    (id_operateur, 'Tapsoba',  'Salif',    'salif.tapsoba@innofaso.com',    hash_pass),
    (id_operateur, 'Belem',    'Rasmata',  'rasmata.belem@innofaso.com',    hash_pass)
  ON CONFLICT (email) DO NOTHING;

  -- ── LECTEUR / AUDITEUR ─────────────────────────────────────────
  INSERT INTO utilisateurs (role_id, nom, prenom, email, mot_de_passe)
  VALUES
    (id_lecteur, 'Diallo', 'Kadiatou', 'kadiatou.diallo@innofaso.com', hash_pass)
  ON CONFLICT (email) DO NOTHING;

  RAISE NOTICE '✅ Utilisateurs insérés avec succès';
END $$;

-- Vérification
SELECT
  u.prenom || ' ' || u.nom AS nom_complet,
  u.email,
  r.nom AS role,
  u.actif
FROM utilisateurs u
JOIN roles r ON r.id = u.role_id
ORDER BY r.nom, u.nom;