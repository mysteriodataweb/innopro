const r = require('express').Router();
const c = require('../controllers/ligne.controller');
const { auth, peutGerer } = require('../middleware/auth');

r.get('/', auth, c.listerLignes);
r.post('/', auth, peutGerer, c.creerLigne);
r.put('/:id', auth, peutGerer, c.modifierLigne);
r.delete('/:id', auth, peutGerer, c.supprimerLigne);

module.exports = r;
