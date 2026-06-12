require('dotenv').config();
require('./src/config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes        = require('./src/modules/auth/auth.routes');
const usersRoutes       = require('./src/modules/users/users.routes');
const formulairesRoutes = require('./src/modules/formulaires/formulaires.routes');
const soumissionsRoutes = require('./src/modules/soumissions/soumissions.routes');
const equipementsRoutes = require('./src/modules/equipements/equipements.routes');
const alertesRoutes     = require('./src/modules/alertes/alertes.routes');
const planningRoutes    = require('./src/modules/planning/planning.routes');
const lignesRoutes      = require('./src/modules/lignes/lignes.routes');
const stockRoutes       = require('./src/modules/stock/stock.routes');
const matieresRoutes    = require('./src/modules/matieres/matieres.routes');
const rapportsRoutes    = require('./src/modules/rapports/rapports.routes');
const dashboardRoutes   = require('./src/modules/dashboard/dashboard.routes');

const app = express();

app.use(helmet());
app.set('trust proxy', 1);
app.use(rateLimit({ windowMs: 15*60*1000, max: 500 }));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE'],
    allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    { stream: logger.httpStream || { write: msg => logger.info(msg.trim()) } }));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// ── Routes API v1 (le proxy Vite réécrit /api → /api/v1) ────────
const v1 = '/api/v1';
app.use(`${v1}/auth`,         authRoutes);
app.use(`${v1}/utilisateurs`, usersRoutes);
app.use(`${v1}/formulaires`,  formulairesRoutes);
app.use(`${v1}/soumissions`,  soumissionsRoutes);
app.use(`${v1}/equipements`,  equipementsRoutes);
app.use(`${v1}/alertes`,      alertesRoutes);
app.use(`${v1}/planning`,     planningRoutes);
app.use(`${v1}/lignes`,       lignesRoutes);
app.use(`${v1}/stock`,        stockRoutes);
app.use(`${v1}/matieres`,     matieresRoutes);
app.use(`${v1}/rapports`,     rapportsRoutes);
app.use(`${v1}/dashboard`,    dashboardRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} non trouvée` }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    logger.info(`🚀 InnoFaso démarré sur http://localhost:${PORT}`);
    try { require('./src/jobs/alertes.cron'); } catch(e) { logger.warn('Cron alertes non démarré:', e.message); }
});

process.on('SIGTERM', () => {
    server.close(() => {
        const { pool } = require('./src/config/db');
        pool.end(() => process.exit(0));
    });
});
process.on('unhandledRejection', (r) => logger.error('Unhandled Rejection', { reason: String(r) }));

module.exports = app;
