const r = require('express').Router();
const db = require('../config/db');
const { auth, peutGerer } = require('../middleware/auth');
// Lister types de champs disponibles
r.get('/types', auth, (req, res) => {
  res.json(['TEXTE','NOMBRE','DATE','HEURE','BOOLEEN','LISTE','SIGNATURE','CALCULE','PHOTO']);
});
module.exports = r;
