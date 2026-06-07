const r = require('express').Router();
const c = require('../controllers/autres.controller');
const { auth } = require('../middleware/auth');
r.get('/stats',    auth, c.stats);
r.get('/activite', auth, c.activiteRecente);
r.get('/retard',   auth, c.formEnRetard);
r.get('/kpi',      auth, c.kpiMensuel);
module.exports = r;
