const db = require('../config/db');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');

// ── UTILISATEURS ──────────────────────────────────────────────
exports.listerUtilisateurs = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.nom, u.prenom, u.email, u.actif, u.derniere_connexion, u.cree_le,
              r.id AS role_id, r.nom AS role_nom
       FROM utilisateur u JOIN role r ON u.role_id = r.id ORDER BY u.nom, u.prenom`);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.listerRoles = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM role ORDER BY nom');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.creerUtilisateur = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, role_id } = req.body;
    if (!nom || !prenom || !email || !mot_de_passe || !role_id)
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    if (mot_de_passe.length < 8)
      return res.status(400).json({ error: 'Mot de passe : 8 caractères minimum' });
    const hash = await bcrypt.hash(mot_de_passe, 12);
    const { rows } = await db.query(
      `INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, role_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, nom, prenom, email, actif, cree_le`,
      [uuid(), nom, prenom, email.toLowerCase().trim(), hash, role_id]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email déjà utilisé' });
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.toggleActif = async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE utilisateur SET actif = NOT actif WHERE id=$1 RETURNING id, actif', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.modifierRole = async (req, res) => {
  try {
    const { role_id } = req.body;
    if (!role_id) return res.status(400).json({ error: 'role_id requis' });
    const { rows } = await db.query(
      'UPDATE utilisateur SET role_id=$1 WHERE id=$2 RETURNING id, nom, prenom, email', [role_id, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// ── ÉQUIPEMENTS ───────────────────────────────────────────────
exports.listerEquipements = async (req, res) => {
  try {
    const { search, type, actif } = req.query;
    const params = []; const cond = [];
    if (search) { params.push(`%${search}%`); cond.push(`(e.nom ILIKE $${params.length} OR e.code_ref ILIKE $${params.length})`); }
    if (type)   { params.push(type);           cond.push(`e.type_equipement = $${params.length}`); }
    if (actif !== undefined) { params.push(actif === 'true'); cond.push(`e.actif = $${params.length}`); }
    const where = cond.length ? 'WHERE ' + cond.join(' AND ') : '';
    const { rows } = await db.query(`SELECT * FROM equipement e ${where} ORDER BY e.code_ref`, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.getEquipement = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM equipement WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Équipement non trouvé' });
    const historique = await db.query(
      `SELECT s.id, s.date_soumission, s.statut, ft.titre AS formulaire
       FROM soumission s JOIN formulaire_type ft ON s.formulaire_type_id = ft.id
       WHERE s.equipement_id=$1 ORDER BY s.date_soumission DESC LIMIT 10`, [req.params.id]);
    const pieces = await db.query('SELECT * FROM piece_rechange WHERE equipement_id=$1', [req.params.id]);
    res.json({ ...rows[0], historique: historique.rows, pieces: pieces.rows });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.creerEquipement = async (req, res) => {
  try {
    const { code_ref, nom, ligne_production, localisation, type_equipement, date_installation } = req.body;
    if (!code_ref || !nom) return res.status(400).json({ error: 'code_ref et nom requis' });
    const { rows } = await db.query(
      `INSERT INTO equipement (id, code_ref, nom, ligne_production, localisation, type_equipement, date_installation)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [uuid(), code_ref, nom, ligne_production||null, localisation||null, type_equipement||null, date_installation||null]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Code de référence déjà utilisé' });
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.modifierEquipement = async (req, res) => {
  try {
    const { nom, localisation, type_equipement, etat, actif, prochaine_maintenance } = req.body;
    const { rows } = await db.query(
      `UPDATE equipement SET
         nom = COALESCE($1, nom), localisation = COALESCE($2, localisation),
         type_equipement = COALESCE($3, type_equipement), etat = COALESCE($4::etat_equip_enum, etat),
         actif = COALESCE($5, actif), prochaine_maintenance = COALESCE($6, prochaine_maintenance)
       WHERE id=$7 RETURNING *`,
      [nom, localisation, type_equipement, etat, actif, prochaine_maintenance, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Équipement non trouvé' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.supprimerEquipement = async (req, res) => {
  try {
    const { rows } = await db.query(
      'DELETE FROM equipement WHERE id=$1 RETURNING id',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Équipement non trouvé' });
    res.json({ success: true, message: 'Équipement supprimé' });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// ── ALERTES ───────────────────────────────────────────────────
exports.listerAlertes = async (req, res) => {
  try {
    if (req.query.sync !== 'false') {
      try {
        const { synchroniserAlertesMaintenance } = require('../services/alertesMaintenance.service');
        await synchroniserAlertesMaintenance();
      } catch (syncErr) {
        console.error('Sync alertes:', syncErr.message);
      }
    }
    const { statut } = req.query;
    const params = [req.user.id]; const cond = ['a.utilisateur_id=$1'];
    if (statut) { params.push(statut); cond.push(`a.statut=$${params.length}`); }
    const { rows } = await db.query(
      `SELECT a.*, ft.titre AS formulaire_titre, e.nom AS equipement_nom
       FROM alerte a
       LEFT JOIN soumission s ON a.soumission_id = s.id
       LEFT JOIN formulaire_type ft ON s.formulaire_type_id = ft.id
       LEFT JOIN equipement e ON a.equipement_id = e.id
       WHERE ${cond.join(' AND ')} ORDER BY a.date_creation DESC LIMIT 50`, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.marquerAlerte = async (req, res) => {
  try {
    const { statut } = req.body; // 'LUE' | 'TRAITEE'
    if (!['LUE','TRAITEE'].includes(statut)) return res.status(400).json({ error: 'Statut invalide' });
    await db.query('UPDATE alerte SET statut=$1 WHERE id=$2 AND utilisateur_id=$3', [statut, req.params.id, req.user.id]);
    res.json({ message: 'Alerte mise à jour' });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.marquerToutesLues = async (req, res) => {
  try {
    await db.query("UPDATE alerte SET statut='LUE' WHERE utilisateur_id=$1 AND statut='NON_LUE'", [req.user.id]);
    res.json({ message: 'Toutes les alertes marquées comme lues' });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// ── STOCK ─────────────────────────────────────────────────────
exports.listerPieces = async (req, res) => {
  try {
    const { search, alerte_stock, equipement_id } = req.query;
    const params = []; const cond = [];
    if (search) { params.push(`%${search}%`); cond.push(`(p.designation ILIKE $${params.length} OR p.reference ILIKE $${params.length})`); }
    if (alerte_stock === 'true') cond.push('p.quantite_stock <= p.seuil_alerte');
    if (equipement_id) { params.push(equipement_id); cond.push(`p.equipement_id=$${params.length}`); }
    const where = cond.length ? 'WHERE ' + cond.join(' AND ') : '';
    const { rows } = await db.query(
      `SELECT p.*, e.nom AS equipement_nom FROM piece_rechange p LEFT JOIN equipement e ON p.equipement_id = e.id ${where} ORDER BY p.designation`, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.creerPiece = async (req, res) => {
  try {
    const { equipement_id, reference, designation, quantite_stock, seuil_alerte, unite } = req.body;
    if (!equipement_id || !reference || !designation) return res.status(400).json({ error: 'equipement_id, reference et designation requis' });
    const { rows } = await db.query(
      `INSERT INTO piece_rechange (id, equipement_id, reference, designation, quantite_stock, seuil_alerte, unite)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [uuid(), equipement_id, reference, designation, quantite_stock||0, seuil_alerte||0, unite||'pièce']);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Référence déjà existante' });
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.mouvement = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { piece_id, type_mouvement, quantite, motif } = req.body;
    if (!piece_id || !type_mouvement || !quantite) return res.status(400).json({ error: 'piece_id, type_mouvement et quantite requis' });
    const sign = type_mouvement === 'ENTREE' ? '+' : '-';
    const { rows } = await client.query(
      `UPDATE piece_rechange SET quantite_stock = quantite_stock ${sign} $1 WHERE id=$2 RETURNING *`, [quantite, piece_id]);
    if (!rows.length) return res.status(404).json({ error: 'Pièce non trouvée' });
    await client.query(
      `INSERT INTO mouvement_stock (id, piece_id, utilisateur_id, type_mouvement, quantite, motif)
       VALUES ($1,$2,$3,$4,$5,$6)`, [uuid(), piece_id, req.user.id, type_mouvement, quantite, motif||null]);
    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    if (e.code === '23514') return res.status(400).json({ error: 'Stock insuffisant pour cette sortie' });
    res.status(500).json({ error: 'Erreur serveur' });
  } finally { client.release(); }
};

exports.historiqueMouvements = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT m.*, p.designation, p.reference, u.nom||' '||u.prenom AS operateur
       FROM mouvement_stock m JOIN piece_rechange p ON m.piece_id=p.id JOIN utilisateur u ON m.utilisateur_id=u.id
       WHERE m.piece_id=$1 ORDER BY m.date_mouvement DESC LIMIT 50`, [req.params.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// ── PLANNING ──────────────────────────────────────────────────
exports.listerPlanning = async (req, res) => {
  try {
    const { mois, annee, statut, equipement_id } = req.query;
    const params = []; const cond = [];
    if (statut)       { params.push(statut);       cond.push(`p.statut=$${params.length}`); }
    if (equipement_id){ params.push(equipement_id); cond.push(`p.equipement_id=$${params.length}`); }
    if (annee && mois) {
      params.push(`${annee}-${String(mois).padStart(2,'0')}-01`);
      params.push(`${annee}-${String(mois).padStart(2,'0')}-31`);
      cond.push(`p.date_prevue BETWEEN $${params.length-1} AND $${params.length}`);
    }
    const where = cond.length ? 'WHERE ' + cond.join(' AND ') : '';
    const { rows } = await db.query(
      `SELECT p.*, ft.code AS form_code, ft.titre AS form_titre,
              e.nom AS equipement_nom, e.code_ref AS equipement_code,
              u.nom||' '||u.prenom AS technicien_nom
       FROM planning_maintenance p
       JOIN formulaire_type ft ON p.formulaire_type_id=ft.id
       JOIN equipement e ON p.equipement_id=e.id
       JOIN utilisateur u ON p.technicien_id=u.id
       ${where} ORDER BY p.date_prevue`, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.creerPlanning = async (req, res) => {
  try {
    const { formulaire_type_id, equipement_id, technicien_id, date_prevue, commentaire } = req.body;
    if (!formulaire_type_id || !equipement_id || !technicien_id || !date_prevue)
      return res.status(400).json({ error: 'formulaire_type_id, equipement_id, technicien_id et date_prevue requis' });
    const { rows } = await db.query(
      `INSERT INTO planning_maintenance (id, formulaire_type_id, equipement_id, technicien_id, date_prevue, commentaire)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [uuid(), formulaire_type_id, equipement_id, technicien_id, date_prevue, commentaire||null]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.updateStatutPlanning = async (req, res) => {
  try {
    const { statut, date_realisee, commentaire } = req.body;
    const { rows } = await db.query(
      `UPDATE planning_maintenance SET statut=$1::statut_plan_enum, date_realisee=$2, commentaire=COALESCE($3,commentaire)
       WHERE id=$4 RETURNING *`, [statut, date_realisee||null, commentaire, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Planning non trouvé' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// ── DASHBOARD ─────────────────────────────────────────────────
exports.stats = async (req, res) => {
  try {
    const [formRes, soumRes, alerteRes, retardRes, planRes, mvtRes] = await Promise.all([
      db.query('SELECT COUNT(*) FROM formulaire_type WHERE actif=true'),
      db.query(`SELECT statut, COUNT(*) FROM soumission WHERE date_soumission >= NOW()-INTERVAL '30 days' GROUP BY statut`),
      db.query(`SELECT statut, COUNT(*) FROM alerte WHERE utilisateur_id=$1 GROUP BY statut`, [req.user.id]),
      db.query('SELECT COUNT(*) FROM v_formulaires_en_retard'),
      db.query(`SELECT statut, COUNT(*) FROM planning_maintenance WHERE date_prevue >= CURRENT_DATE-7 GROUP BY statut`),
      db.query(`SELECT type_mouvement, SUM(quantite) AS total FROM mouvement_stock WHERE date_mouvement >= NOW()-INTERVAL '7 days' GROUP BY type_mouvement`),
    ]);
    const soumParStatut = {}; soumRes.rows.forEach(r => soumParStatut[r.statut] = +r.count);
    const alerteParStatut = {}; alerteRes.rows.forEach(r => alerteParStatut[r.statut] = +r.count);
    const planParStatut = {}; planRes.rows.forEach(r => planParStatut[r.statut] = +r.count);
    const mvtParType = {}; mvtRes.rows.forEach(r => mvtParType[r.type_mouvement] = +r.total);
    res.json({
      formulaires_actifs: +formRes.rows[0].count,
      soumissions_30j: soumParStatut,
      alertes: alerteParStatut,
      formulaires_en_retard: +retardRes.rows[0].count,
      planning_7j: planParStatut,
      mouvements_stock_7j: mvtParType,
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.activiteRecente = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT s.id, s.statut, s.date_soumission, s.source,
             ft.code AS form_code, ft.titre AS form_titre, ft.module,
             u.nom||' '||u.prenom AS auteur
      FROM soumission s
      JOIN formulaire_type ft ON s.formulaire_type_id=ft.id
      JOIN utilisateur u ON s.utilisateur_id=u.id
      ORDER BY s.date_soumission DESC LIMIT 15`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.formEnRetard = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM v_formulaires_en_retard ORDER BY jours_retard DESC NULLS FIRST LIMIT 20');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.kpiMensuel = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT DATE_TRUNC('month', date_soumission) AS mois,
             module, statut, COUNT(*) AS total
      FROM soumission s JOIN formulaire_type ft ON s.formulaire_type_id=ft.id
      WHERE date_soumission >= NOW()-INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', date_soumission), module, statut
      ORDER BY mois DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};
