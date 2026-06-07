const r = require('express').Router();
const c = require('../controllers/autres.controller');
const { auth, adminSeulement, peutGerer } = require('../middleware/auth');
r.get('/',             auth, peutGerer,      c.listerUtilisateurs);
r.get('/roles',        auth, peutGerer,      c.listerRoles);
r.post('/',            auth, adminSeulement, c.creerUtilisateur);
r.patch('/:id/actif',  auth, adminSeulement, c.toggleActif);
r.patch('/:id/role',   auth, adminSeulement, c.modifierRole);
module.exports = r;
