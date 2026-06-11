const r = require('express').Router();
const c = require('../controllers/autres.controller');
const { auth, peutGerer } = require('../middleware/auth');
r.get('/',     auth, c.listerEquipements);
r.get('/:id',  auth, c.getEquipement);
r.post('/',    auth, peutGerer, c.creerEquipement);
r.put('/:id',  auth, peutGerer, c.modifierEquipement);
r.delete('/:id', auth, peutGerer, c.supprimerEquipement);
module.exports = r;
