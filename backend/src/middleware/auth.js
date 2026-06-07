const jwt = require('jsonwebtoken');
const db  = require('../config/db');

const auth = async (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token manquant' });
    const decoded = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    const { rows } = await db.query(
      `SELECT u.*, r.nom AS role_nom FROM utilisateur u JOIN role r ON u.role_id = r.id WHERE u.id = $1 AND u.actif = true`,
      [decoded.id]
    );
    if (!rows.length) return res.status(401).json({ error: 'Utilisateur non autorisé' });
    req.user = rows[0];
    next();
  } catch (e) {
    res.status(401).json({ error: e.name === 'TokenExpiredError' ? 'Session expirée' : 'Token invalide' });
  }
};

const roles = (...allowed) => (req, res, next) =>
  allowed.includes(req.user.role_nom) ? next() : res.status(403).json({ error: 'Accès refusé' });

const peutSoumettre = roles('Admin','Responsable','Technicien','Operateur');
const peutValider   = roles('Admin','Responsable');
const peutGerer     = roles('Admin','Responsable');
const adminSeulement = roles('Admin');

module.exports = { auth, roles, peutSoumettre, peutValider, peutGerer, adminSeulement };
