const r = require('express').Router();
const c = require('../controllers/autres.controller');
const { auth, peutGerer } = require('../middleware/auth');
r.get('/pieces',                      auth, c.listerPieces);
r.post('/pieces',                     auth, peutGerer, c.creerPiece);
r.post('/pieces/mouvement',           auth, c.mouvement);
r.get('/pieces/:id/mouvements',       auth, c.historiqueMouvements);
module.exports = r;
