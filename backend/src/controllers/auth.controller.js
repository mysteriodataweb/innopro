const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    if (!email || !mot_de_passe) return res.status(400).json({ error: 'Email et mot de passe requis' });
    const { rows } = await db.query(
      `SELECT u.*, r.nom AS role_nom FROM utilisateur u JOIN role r ON u.role_id = r.id WHERE u.email = $1 AND u.actif = true`,
      [email.toLowerCase().trim()]
    );
    if (!rows.length || !(await bcrypt.compare(mot_de_passe, rows[0].mot_de_passe)))
      return res.status(401).json({ error: 'Identifiants incorrects' });
    const u = rows[0];
    const token = jwt.sign({ id: u.id, role: u.role_nom }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    await db.query(`UPDATE utilisateur SET derniere_connexion = NOW() WHERE id = $1`, [u.id]);
    await db.query(`INSERT INTO audit_log (utilisateur_id, action, adresse_ip, appareil) VALUES ($1,'LOGIN',$2,$3)`,
      [u.id, req.ip, req.headers['user-agent']]);
    res.json({ token, utilisateur: { id: u.id, nom: u.nom, prenom: u.prenom, email: u.email, role: u.role_nom } });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

exports.me = (req, res) => res.json({
  id: req.user.id, nom: req.user.nom, prenom: req.user.prenom,
  email: req.user.email, role: req.user.role_nom
});

exports.changePassword = async (req, res) => {
  try {
    const { ancien, nouveau } = req.body;
    if (!ancien || !nouveau || nouveau.length < 8) return res.status(400).json({ error: 'Données invalides (min 8 caractères)' });
    const { rows } = await db.query('SELECT mot_de_passe FROM utilisateur WHERE id=$1', [req.user.id]);
    if (!(await bcrypt.compare(ancien, rows[0].mot_de_passe))) return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
    await db.query('UPDATE utilisateur SET mot_de_passe=$1 WHERE id=$2', [await bcrypt.hash(nouveau, 12), req.user.id]);
    res.json({ message: 'Mot de passe modifié' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};
