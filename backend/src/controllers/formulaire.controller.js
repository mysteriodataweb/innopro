const db = require('../config/db');
const { v4: uuid } = require('uuid');
const {
  normalizeSchema,
  spreadsheetToSchema,
  legacyChampsToSchema,
  schemaToChampDefinitions,
} = require('../services/formSchema.service');
const { applyDelta, requestGroqDelta } = require('../services/formAi.service');

async function ensureSchemaColumns(client = db) {
  await client.query(`
    ALTER TABLE formulaire_type
      ADD COLUMN IF NOT EXISTS schema_json JSONB,
      ADD COLUMN IF NOT EXISTS schema_source VARCHAR(50),
      ADD COLUMN IF NOT EXISTS schema_version VARCHAR(20)
  `);
}

async function replaceSchemaAndFields(client, formulaireId, schema) {
  const normalized = normalizeSchema(schema);
  const champs = schemaToChampDefinitions(normalized);

  await ensureSchemaColumns(client);
  await client.query(
    `UPDATE formulaire_type
       SET schema_json=$1, schema_source=$2, schema_version=$3
     WHERE id=$4`,
    [JSON.stringify(normalized), normalized.source?.type || 'schema', normalized.version, formulaireId]
  );

  await client.query(
    `UPDATE champ_definition SET actif=false WHERE formulaire_type_id=$1`,
    [formulaireId]
  );

  const fieldsWithLegacyIds = [];
  for (const champ of champs) {
    const champId = uuid();
    await client.query(
      `INSERT INTO champ_definition
         (id, formulaire_type_id, nom_champ, type_champ, section, obligatoire, ordre, unite, options_liste)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        champId,
        formulaireId,
        champ.nom_champ,
        champ.type_champ,
        champ.section,
        champ.obligatoire,
        champ.ordre,
        champ.unite,
        champ.options_liste ? JSON.stringify(champ.options_liste) : null,
      ]
    );
    fieldsWithLegacyIds.push({ schema_field_id: champ.schema_field_id, champId });
  }

  const hydrated = {
    ...normalized,
    fields: normalized.fields.map(field => {
      const match = fieldsWithLegacyIds.find(item => item.schema_field_id === field.id);
      return match ? { ...field, legacyChampId: match.champId } : field;
    }),
  };

  await client.query(
    `UPDATE formulaire_type SET schema_json=$1 WHERE id=$2`,
    [JSON.stringify(hydrated), formulaireId]
  );

  return hydrated;
}

// ── FORMULAIRES ──────────────────────────────────────────────

exports.lister = async (req, res) => {
  try {
    const { module, frequence, search, actif } = req.query;
    const params = []; const cond = [];
    if (module)    { params.push(module);       cond.push(`ft.module = $${params.length}`); }
    if (frequence) { params.push(frequence);    cond.push(`ft.frequence = $${params.length}`); }
    if (actif !== undefined) { params.push(actif === 'true'); cond.push(`ft.actif = $${params.length}`); }
    if (search)    { params.push(`%${search}%`); cond.push(`(ft.titre ILIKE $${params.length} OR ft.code ILIKE $${params.length})`); }
    const where = cond.length ? 'WHERE ' + cond.join(' AND ') : '';
    const { rows } = await db.query(`
      SELECT ft.*,
        (SELECT COUNT(*) FROM champ_definition cd WHERE cd.formulaire_type_id = ft.id AND cd.actif = true) AS nb_champs,
        (SELECT MAX(s.date_soumission) FROM soumission s WHERE s.formulaire_type_id = ft.id) AS derniere_soumission
      FROM formulaire_type ft ${where}
      ORDER BY ft.module, ft.frequence, ft.titre`, params);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.getUn = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM formulaire_type WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Formulaire non trouvé' });
    const champs = await db.query(
      `SELECT cd.*, cs.nom_champ AS champ_source_nom
       FROM champ_definition cd
       LEFT JOIN champ_definition cs ON cd.champ_source_id = cs.id
       WHERE cd.formulaire_type_id = $1 AND cd.actif = true
       ORDER BY cd.section, cd.ordre`, [req.params.id]);
    // Regrouper par section
    const sections = {};
    champs.rows.forEach(c => {
      const s = c.section || 'Général';
      if (!sections[s]) sections[s] = [];
      sections[s].push(c);
    });
    const schema_json = rows[0].schema_json || legacyChampsToSchema(rows[0], champs.rows);
    res.json({ ...rows[0], schema_json, champs: champs.rows, sections });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.creer = async (req, res) => {
  try {
    const { code, titre, module, frequence } = req.body;
    if (!code || !titre || !module || !frequence)
      return res.status(400).json({ error: 'code, titre, module, frequence sont requis' });
    const { rows } = await db.query(
      `INSERT INTO formulaire_type (id, code, titre, module, frequence)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [uuid(), code, titre, module, frequence]);
    await db.query(`INSERT INTO audit_log (utilisateur_id, action, table_cible, enregistrement_id, nouvelle_valeur) VALUES ($1,'INSERT','formulaire_type',$2,$3)`,
      [req.user.id, rows[0].id, JSON.stringify(rows[0])]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Ce code de formulaire existe déjà' });
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.modifier = async (req, res) => {
  try {
    const { titre, module, frequence, actif } = req.body;
    const { rows } = await db.query(
      `UPDATE formulaire_type SET
         titre = COALESCE($1, titre),
         module = COALESCE($2, module),
         frequence = COALESCE($3, frequence),
         actif = COALESCE($4, actif)
       WHERE id = $5 RETURNING *`,
      [titre, module, frequence, actif, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Formulaire non trouvé' });
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.supprimer = async (req, res) => {
  try {
    // Soft delete (désactiver)
    await db.query('UPDATE formulaire_type SET actif = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Formulaire désactivé' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

// ── CHAMPS D'UN FORMULAIRE ────────────────────────────────────

exports.ajouterChamp = async (req, res) => {
  try {
    const { nom_champ, type_champ, section, obligatoire, ordre, unite, options_liste, formule, champ_source_id } = req.body;
    if (!nom_champ || !type_champ) return res.status(400).json({ error: 'nom_champ et type_champ requis' });
    // Calculer l'ordre max si non fourni
    let ordreVal = ordre;
    if (!ordreVal) {
      const { rows: maxRows } = await db.query(
        'SELECT COALESCE(MAX(ordre),0)+1 AS next FROM champ_definition WHERE formulaire_type_id = $1', [req.params.id]);
      ordreVal = maxRows[0].next;
    }
    const { rows } = await db.query(
      `INSERT INTO champ_definition
         (id, formulaire_type_id, champ_source_id, nom_champ, type_champ, section, obligatoire, ordre, unite, options_liste, formule)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [uuid(), req.params.id, champ_source_id||null, nom_champ, type_champ,
       section||'Général', obligatoire||false, ordreVal, unite||null,
       options_liste ? JSON.stringify(options_liste) : null, formule||null]);
    res.status(201).json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.modifierChamp = async (req, res) => {
  try {
    const { nom_champ, type_champ, section, obligatoire, ordre, unite, options_liste, formule, actif } = req.body;
    const { rows } = await db.query(
      `UPDATE champ_definition SET
         nom_champ = COALESCE($1, nom_champ),
         type_champ = COALESCE($2::type_champ_enum, type_champ),
         section = COALESCE($3, section),
         obligatoire = COALESCE($4, obligatoire),
         ordre = COALESCE($5, ordre),
         unite = COALESCE($6, unite),
         options_liste = COALESCE($7, options_liste),
         formule = COALESCE($8, formule),
         actif = COALESCE($9, actif)
       WHERE id = $10 AND formulaire_type_id = $11 RETURNING *`,
      [nom_champ, type_champ, section, obligatoire, ordre, unite,
       options_liste ? JSON.stringify(options_liste) : null, formule, actif,
       req.params.champId, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Champ non trouvé' });
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.supprimerChamp = async (req, res) => {
  try {
    await db.query('UPDATE champ_definition SET actif = false WHERE id = $1 AND formulaire_type_id = $2',
      [req.params.champId, req.params.id]);
    res.json({ message: 'Champ désactivé' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.reordonnerChamps = async (req, res) => {
  // req.body = [{ id, ordre }, ...]
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    for (const { id, ordre } of req.body) {
      await client.query('UPDATE champ_definition SET ordre=$1 WHERE id=$2 AND formulaire_type_id=$3', [ordre, id, req.params.id]);
    }
    await client.query('COMMIT');
    res.json({ message: 'Ordre mis à jour' });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  } finally { client.release(); }
};

exports.getSchema = async (req, res) => {
  try {
    await ensureSchemaColumns();
    const { rows } = await db.query('SELECT * FROM formulaire_type WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Formulaire non trouvÃ©' });
    if (rows[0].schema_json) return res.json(rows[0].schema_json);

    const champs = await db.query(
      `SELECT * FROM champ_definition WHERE formulaire_type_id=$1 AND actif=true ORDER BY section, ordre`,
      [req.params.id]
    );
    res.json(legacyChampsToSchema(rows[0], champs.rows));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.enregistrerSchema = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const schema = await replaceSchemaAndFields(client, req.params.id, req.body.schema || req.body);
    await client.query('COMMIT');
    res.json(schema);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  } finally { client.release(); }
};

exports.genererDepuisTableur = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM formulaire_type WHERE id=$1', [req.params.id]);
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Formulaire non trouvÃ©' });
    }
    const schema = spreadsheetToSchema(req.body.sheet, {
      title: rows[0].titre,
      columns: req.body.sheet?.columns || 2,
    });
    const saved = await replaceSchemaAndFields(client, req.params.id, schema);
    await client.query('COMMIT');
    res.json(saved);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  } finally { client.release(); }
};

exports.modifierDepuisPrompt = async (req, res) => {
  const client = await db.getClient();
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt requis' });

    await client.query('BEGIN');
    await ensureSchemaColumns(client);
    const { rows } = await client.query('SELECT * FROM formulaire_type WHERE id=$1', [req.params.id]);
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Formulaire non trouvÃ©' });
    }

    const champs = await client.query(
      `SELECT * FROM champ_definition WHERE formulaire_type_id=$1 AND actif=true ORDER BY section, ordre`,
      [req.params.id]
    );
    const currentSchema = rows[0].schema_json || legacyChampsToSchema(rows[0], champs.rows);
    const delta = await requestGroqDelta(currentSchema, prompt);
    const nextSchema = applyDelta(currentSchema, delta);
    const saved = await replaceSchemaAndFields(client, req.params.id, {
      ...nextSchema,
      source: { type: 'ai_prompt', provider: 'groq', delta },
    });
    await client.query('COMMIT');
    res.json({ schema: saved, delta });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(e.status || 500).json({ error: e.message || 'Erreur serveur' });
  } finally { client.release(); }
};

exports.importerSchema = async (req, res) => {
  const client = await db.getClient();
  try {
    const schema = req.body.schema || (req.body.sheet ? spreadsheetToSchema(req.body.sheet) : null);
    if (!schema) return res.status(400).json({ error: 'schema ou sheet requis' });
    await client.query('BEGIN');
    const saved = await replaceSchemaAndFields(client, req.params.id, {
      ...schema,
      source: schema.source || { type: 'external_import' },
    });
    await client.query('COMMIT');
    res.json(saved);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e); res.status(500).json({ error: 'Erreur serveur' });
  } finally { client.release(); }
};
