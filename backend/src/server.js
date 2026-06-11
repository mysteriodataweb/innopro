require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 300 }));
app.use(express.json({ limit: '20mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/utilisateurs', require('./routes/utilisateur.routes'));
app.use('/api/formulaires',  require('./routes/formulaire.routes'));
app.use('/api/champs',       require('./routes/champ.routes'));
app.use('/api/soumissions',  require('./routes/soumission.routes'));
app.use('/api/equipements',  require('./routes/equipement.routes'));
app.use('/api/alertes',      require('./routes/alerte.routes'));
app.use('/api/stock',        require('./routes/stock.routes'));
app.use('/api/planning',     require('./routes/planning.routes'));
app.use('/api/lignes',       require('./routes/ligne.routes'));
app.use('/api/dashboard',    require('./routes/dashboard.routes'));

app.get('/api/health', (_, res) => res.json({ ok: true, ts: new Date() }));
app.use((_, res) => res.status(404).json({ error: 'Route non trouvée' }));
app.use((err, _, res, __) => {
  console.error(err);
  res.status(err.status || 500).json({ error: process.env.NODE_ENV === 'production' ? 'Erreur serveur' : err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 InnoFaso API v2 → port ${PORT}`));
module.exports = app;
