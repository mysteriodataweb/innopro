const r = require('express').Router();
const c = require('../controllers/soumission.controller');
const { auth, peutSoumettre, peutValider } = require('../middleware/auth');
r.get('/',              auth, c.lister);
r.get('/:id',           auth, c.getUne);
r.post('/',             auth, peutSoumettre, c.creer);
r.patch('/:id/statut',  auth, peutValider,   c.valider);
r.post('/sync',         auth, peutSoumettre, c.syncOffline);
module.exports = r;
