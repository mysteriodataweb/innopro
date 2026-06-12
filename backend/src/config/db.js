const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,
    max: 20,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
});

// Événement sur erreur inattendue d'un client inactif
pool.on('error', (err) => {
    console.error('❌ Erreur inattendue sur le pool PostgreSQL :', err.message);
});

// Test de connexion au démarrage
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Impossible de se connecter à PostgreSQL :', err.message);
        process.exit(1);
    }
    console.log('✅ Connecté à PostgreSQL :', env.db.name);
    release();
});

const query = (text, params) => pool.query(text, params);

const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = { pool, query, transaction };
