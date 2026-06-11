const db = require('../config/db');
const { v4: uuid } = require('uuid');

exports.listerLignes = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM ligne_production WHERE actif = TRUE ORDER BY code'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.creerLigne = async (req, res) => {
  try {
    const { code, nom, description } = req.body;
    if (!code || !nom) {
      return res.status(400).json({ error: 'Code et nom requis' });
    }
    const { rows } = await db.query(
      `INSERT INTO ligne_production (id, code, nom, description, actif)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING *`,
      [uuid(), code.toUpperCase(), nom, description || null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Code de ligne déjà utilisé' });
    }
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.modifierLigne = async (req, res) => {
  try {
    const { code, nom, description, actif } = req.body;
    const { rows } = await db.query(
      `UPDATE ligne_production
       SET code = COALESCE($1, code),
           nom = COALESCE($2, nom),
           description = COALESCE($3, description),
           actif = COALESCE($4, actif)
       WHERE id = $5
       RETURNING *`,
      [code ? code.toUpperCase() : null, nom, description, actif, req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Ligne non trouvée' });
    }
    res.json(rows[0]);
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Code de ligne déjà utilisé' });
    }
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.supprimerLigne = async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE ligne_production SET actif = FALSE WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Ligne non trouvée' });
    }
    res.json({ success: true, message: 'Ligne désactivée' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
