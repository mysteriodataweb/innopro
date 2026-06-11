const r = require('express').Router();
const c = require('../controllers/champ.controller');
const { auth, peutGerer } = require('../middleware/auth');

// Lister types de champs disponibles
r.get('/types', auth, (req, res) => {
  res.json(['TEXTE','NOMBRE','DATE','HEURE','BOOLEEN','LISTE','SIGNATURE','CALCULE','PHOTO']);
});

// CRUD pour les champs de formulaires
r.get('/formulaire/:formulaireId', auth, c.listerChamps);
r.post('/formulaire/:formulaireId', auth, peutGerer, c.creerChamp);
r.put('/formulaire/:formulaireId/:champId', auth, peutGerer, c.modifierChamp);
r.delete('/formulaire/:formulaireId/:champId', auth, peutGerer, c.supprimerChamp);

module.exports = r;
