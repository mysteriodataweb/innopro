const r = require('express').Router();
const c = require('../controllers/autres.controller');
const { auth } = require('../middleware/auth');
r.get('/',               auth, c.listerAlertes);
r.patch('/:id',          auth, c.marquerAlerte);
r.patch('/toutes/lues',  auth, c.marquerToutesLues);
module.exports = r;
