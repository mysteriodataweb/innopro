const db = require('../config/db');
const { v4: uuid } = require('uuid');

exports.listerChamps = async (req, res) => {
  try {
    const { formulaireId } = req.params;
    const { rows } = await db.query(
      `SELECT * FROM champ_definition 
       WHERE formulaire_type_id = $1 AND actif = TRUE 
       ORDER BY ordre`,
      [formulaireId]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.creerChamp = async (req, res) => {
  try {
    const { formulaireId } = req.params;
    const { nom_champ, type_champ, section, obligatoire, ordre, unite, options_liste, formule } = req.body;
    
    if (!nom_champ || !type_champ) {
      return res.status(400).json({ error: 'nom_champ et type_champ requis' });
    }
    
    const { rows } = await db.query(
      `INSERT INTO champ_definition 
       (id, formulaire_type_id, nom_champ, type_champ, section, obligatoire, ordre, unite, options_liste, formule, actif)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
       RETURNING *`,
      [
        uuid(),
        formulaireId,
        nom_champ,
        type_champ,
        section || null,
        obligatoire || false,
        ordre || 0,
        unite || null,
        options_liste ? JSON.stringify(options_liste) : null,
        formule || null
      ]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.modifierChamp = async (req, res) => {
  try {
    const { formulaireId, champId } = req.params;
    const { nom_champ, type_champ, section, obligatoire, ordre, unite, options_liste, formule, actif } = req.body;
    
    const { rows } = await db.query(
      `UPDATE champ_definition
       SET nom_champ = COALESCE($1, nom_champ),
           type_champ = COALESCE($2, type_champ),
           section = COALESCE($3, section),
           obligatoire = COALESCE($4, obligatoire),
           ordre = COALESCE($5, ordre),
           unite = COALESCE($6, unite),
           options_liste = COALESCE($7, options_liste),
           formule = COALESCE($8, formule),
           actif = COALESCE($9, actif)
       WHERE id = $10 AND formulaire_type_id = $11
       RETURNING *`,
      [
        nom_champ,
        type_champ,
        section,
        obligatoire,
        ordre,
        unite,
        options_liste ? JSON.stringify(options_liste) : null,
        formule,
        actif,
        champId,
        formulaireId
      ]
    );
    
    if (!rows.length) {
      return res.status(404).json({ error: 'Champ non trouvé' });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.supprimerChamp = async (req, res) => {
  try {
    const { formulaireId, champId } = req.params;
    
    const { rows } = await db.query(
      `UPDATE champ_definition 
       SET actif = FALSE 
       WHERE id = $1 AND formulaire_type_id = $2 
       RETURNING id`,
      [champId, formulaireId]
    );
    
    if (!rows.length) {
      return res.status(404).json({ error: 'Champ non trouvé' });
    }
    res.json({ success: true, message: 'Champ désactivé' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
