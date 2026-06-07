#!/usr/bin/env node
/**
 * Applique les migrations planning (idempotent).
 * Si la base v3 est déjà là, seule l'extension v3.1 est exécutée.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'inno',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'trust',
});

async function tableExists(client, tableName) {
  const { rows } = await client.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );
  return rows.length > 0;
}

async function columnExists(client, tableName, columnName) {
  const { rows } = await client.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function runSqlFile(client, filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ Fichier ignoré: ${label}`);
    return false;
  }
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`\n📄 ${label} (${sql.length} caractères)`);
  console.log('⏳ Exécution…');
  await client.query(sql);
  console.log(`✅ ${label} OK`);
  return true;
}

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🔄 Connexion à la base de données…');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'inno'}`);
    console.log(`   User: ${process.env.DB_USER || 'postgres'}`);

    const migrationsDir = path.join(__dirname, '../../migrations');
    const baseFile = path.join(migrationsDir, '2026-06-03_planning_maintenance_complete.sql');
    const extFile = path.join(migrationsDir, '2026-06-03_planning_v3_extensions.sql');

    const baseExists = await tableExists(client, 'planning_semaine');

    if (baseExists) {
      console.log('\nℹ️  Tables planning de base déjà présentes — migration complète ignorée.');
    } else {
      await runSqlFile(client, baseFile, '2026-06-03_planning_maintenance_complete.sql');
    }

    await runSqlFile(client, extFile, '2026-06-03_planning_v3_extensions.sql');

    console.log('\n📊 Vérification…');

    const checks = [
      ['planning_semaine', null],
      ['intervention_ligne', null],
      ['suivi_equipement_action', null],
      ['planning_semaine', 'mois'],
      ['planning_semaine', 'semaine_index'],
    ];

    for (const [table, col] of checks) {
      const ok = col
        ? await columnExists(client, table, col)
        : await tableExists(client, table);
      console.log(`  ${ok ? '✓' : '✗'} ${table}${col ? `.${col}` : ''}`);
      if (!ok) {
        console.error(`\n❌ Élément manquant: ${table}${col ? `.${col}` : ''}`);
        process.exit(1);
      }
    }

    const form = await client.query(
      `SELECT COUNT(*)::int AS n FROM formulaire_type WHERE code = 'PS-ME-MC-A'`
    );
    console.log(`  ✓ Formulaire PS-ME-MC-A (${form.rows[0].n})`);

    console.log('\n✨ Migrations terminées avec succès !');
  } catch (err) {
    console.error('\n❌ Erreur lors de la migration:');
    console.error(err.message);
    if (err.detail) console.error('Détail:', err.detail);
    if (err.hint) console.error('Hint:', err.hint);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
