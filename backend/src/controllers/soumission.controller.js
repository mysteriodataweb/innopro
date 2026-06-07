const db = require('../config/db');
const { v4: uuid } = require('uuid');
const { syncSoumissionToPlanning } = require('../services/planningSync.service');

exports.lister = async (req, res) => {
  try {
    const { formulaire_type_id, statut, module, page = 1, limit = 20 } = req.query;
    const params = []; const cond = [];
    if (formulaire_type_id) { params.push(formulaire_type_id); cond.push(`s.formulaire_type_id=$${params.length}`); }
    if (statut) { params.push(statut); cond.push(`s.statut=$${params.length}`); }
    if (module) { params.push(module); cond.push(`ft.module=$${params.length}`); }
    if (['Technicien','Operateur'].includes(req.user.role_nom)) {
      params.push(req.user.id); cond.push(`s.utilisateur_id=$${params.length}`);
    }
    const where = cond.length ? 'WHERE ' + cond.join(' AND ') : '';
    const offset = (page - 1) * limit;
    params.push(limit); params.push(offset);
    const { rows } = await db.query(`
      SELECT s.id, s.statut, s.date_soumission, s.source,
             ft.code AS form_code, ft.titre AS form_titre, ft.module,
             u.nom||' '||u.prenom AS auteur,
             e.nom AS equipement
      FROM soumission s
      JOIN formulaire_type ft ON s.formulaire_type_id = ft.id
      JOIN utilisateur u ON s.utilisateur_id = u.id
      LEFT JOIN equipement e ON s.equipement_id = e.id
      ${where} ORDER BY s.date_soumission DESC
      LIMIT $${params.length-1} OFFSET $${params.length}`, params);
    const countParams = params.slice(0, -2);
    const { rows: cnt } = await db.query(
      `SELECT COUNT(*)
       FROM soumission s
       JOIN formulaire_type ft ON s.formulaire_type_id = ft.id
       ${where}`,
      countParams
    );
    res.json({ data: rows, total: +cnt[0].count, page: +page, totalPages: Math.ceil(cnt[0].count/limit) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.getUne = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT s.*, ft.code AS form_code, ft.titre AS form_titre, ft.module,
             u.nom||' '||u.prenom AS auteur_nom, r.nom AS auteur_role,
             e.nom AS equipement_nom, e.code_ref AS equipement_code
      FROM soumission s
      JOIN formulaire_type ft ON s.formulaire_type_id = ft.id
      JOIN utilisateur u ON s.utilisateur_id = u.id
      JOIN role r ON u.role_id = r.id
      LEFT JOIN equipement e ON s.equipement_id = e.id
      WHERE s.id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Soumission non trouvée' });

    // Entête
    const entete = await db.query('SELECT * FROM entete WHERE soumission_id = $1', [req.params.id]);

    // Valeurs saisies avec définition des champs
    const valeurs = await db.query(`
      SELECT vs.*, cd.nom_champ, cd.type_champ, cd.section, cd.ordre, cd.unite
      FROM valeur_saisie vs
      JOIN champ_definition cd ON vs.champ_def_id = cd.id
      WHERE vs.soumission_id = $1
      ORDER BY cd.section, cd.ordre`, [req.params.id]);

    res.json({ ...rows[0], entete: entete.rows[0] || null, valeurs: valeurs.rows });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.creer = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const {
      formulaire_type_id, equipement_id, source = 'EN_LIGNE',
      id_local, cree_localement_le,
      entete: enteteData, valeurs
    } = req.body;

    if (!formulaire_type_id) return res.status(400).json({ error: 'formulaire_type_id requis' });
    if (!valeurs || !Array.isArray(valeurs)) return res.status(400).json({ error: 'valeurs (tableau) requis' });

    // Valider les champs obligatoires
    const { rows: champs } = await client.query(
      'SELECT id, nom_champ, obligatoire FROM champ_definition WHERE formulaire_type_id=$1 AND actif=true',
      [formulaire_type_id]);
    const valeursMap = Object.fromEntries(valeurs.map(v => [v.champ_def_id, v]));
    for (const c of champs) {
      if (c.obligatoire && !valeursMap[c.id]) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Champ obligatoire manquant : "${c.nom_champ}"` });
      }
    }

    // Créer la soumission
    const soumId = uuid();
    await client.query(`
      INSERT INTO soumission (id, formulaire_type_id, utilisateur_id, equipement_id, statut, source, id_local, cree_localement_le)
      VALUES ($1,$2,$3,$4,'SOUMIS',$5,$6,$7)`,
      [soumId, formulaire_type_id, req.user.id, equipement_id||null,
       source, id_local||null, cree_localement_le||null]);

    // Créer l'entête
    if (enteteData) {
      await client.query(`
        INSERT INTO entete (id, soumission_id, emetteur_nom, emetteur_fonction, emetteur_date, emetteur_signature,
                            verificateur_nom, verificateur_fonction, verificateur_date, verificateur_signature,
                            approbateur_nom, approbateur_fonction, approbateur_date, approbateur_signature)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [uuid(), soumId,
         enteteData.emetteur_nom||null, enteteData.emetteur_fonction||null, enteteData.emetteur_date||null, enteteData.emetteur_signature||null,
         enteteData.verificateur_nom||null, enteteData.verificateur_fonction||null, enteteData.verificateur_date||null, enteteData.verificateur_signature||null,
         enteteData.approbateur_nom||null, enteteData.approbateur_fonction||null, enteteData.approbateur_date||null, enteteData.approbateur_signature||null]);
    }

    // Insérer les valeurs saisies
    for (const v of valeurs) {
      if (!v.champ_def_id) continue;
      await client.query(`
        INSERT INTO valeur_saisie (id, soumission_id, champ_def_id,
          valeur_texte, valeur_nombre, valeur_date, valeur_booleen, valeur_json, est_conforme)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [uuid(), soumId, v.champ_def_id,
         v.valeur_texte||null, v.valeur_nombre||null, v.valeur_date||null,
         v.valeur_booleen !== undefined ? v.valeur_booleen : null,
         v.valeur_json ? JSON.stringify(v.valeur_json) : null,
         v.est_conforme !== undefined ? v.est_conforme : null]);
    }

    if (source === 'EN_LIGNE') {
      await client.query('UPDATE soumission SET synchronise_le = NOW() WHERE id=$1', [soumId]);
    }

    await client.query('COMMIT');

    try {
      await syncSoumissionToPlanning(soumId);
      const { synchroniserAlertesMaintenance } = require('../services/alertesMaintenance.service');
      await synchroniserAlertesMaintenance();
    } catch (syncErr) {
      console.error('Sync planning:', syncErr.message);
    }

    await db.query(`INSERT INTO audit_log (utilisateur_id, action, table_cible, enregistrement_id) VALUES ($1,'INSERT','soumission',$2)`,
      [req.user.id, soumId]);

    res.status(201).json({ id: soumId, statut: 'SOUMIS' });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  } finally { client.release(); }
};

exports.valider = async (req, res) => {
  try {
    const { statut } = req.body; // 'VALIDE' | 'BROUILLON'
    if (!['VALIDE','BROUILLON'].includes(statut)) return res.status(400).json({ error: 'Statut invalide' });
    const { rows } = await db.query(
      'UPDATE soumission SET statut=$1 WHERE id=$2 RETURNING *', [statut, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Soumission non trouvée' });
    // Mettre à jour l'entête approbateur
    if (statut === 'VALIDE' && req.body.approbateur_signature) {
      await db.query(`UPDATE entete SET approbateur_nom=$1, approbateur_fonction=$2, approbateur_date=CURRENT_DATE, approbateur_signature=$3
                      WHERE soumission_id=$4`,
        [req.user.nom+' '+req.user.prenom, req.user.role_nom, req.body.approbateur_signature, req.params.id]);
    }
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.syncOffline = async (req, res) => {
  const { soumissions = [] } = req.body;
  const results = { success: [], errors: [] };
  for (const s of soumissions) {
    try {
      const fakeReq = { body: { ...s, source: 'HORS_LIGNE' }, user: req.user };
      // Appel interne simplifié
      await exports.creer(fakeReq, { status: () => ({ json: () => {} }), json: (d) => results.success.push(d.id) });
    } catch (e) { results.errors.push({ id_local: s.id_local, error: e.message }); }
  }
  res.json(results);
};
