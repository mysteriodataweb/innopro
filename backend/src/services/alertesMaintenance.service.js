const db = require('../config/db');
const { v4: uuid } = require('uuid');

const PANNE_KEYWORDS = /panne|critique|urgence|sécurité|securite|danger|arrêt|arret|immobilis|bloqué|bloque/i;

async function getUtilisateursCibles(client, { roles = ['Admin', 'Responsable', 'Technicien'] } = {}) {
  const { rows } = await client.query(
    `SELECT u.id, r.nom AS role_nom
     FROM utilisateur u
     JOIN role r ON u.role_id = r.id
     WHERE u.actif = TRUE AND r.nom = ANY($1::text[])`,
    [roles]
  );
  return rows;
}

async function creerAlerteSiAbsente(client, { utilisateur_id, type_alerte, message, equipement_id, soumission_id }) {
  const { rows } = await client.query(
    `SELECT id FROM alerte
     WHERE utilisateur_id = $1 AND type_alerte = $2
       AND message = $3 AND statut = 'NON_LUE'
       AND date_creation > NOW() - INTERVAL '12 hours'`,
    [utilisateur_id, type_alerte, message]
  );
  if (rows.length) return null;

  const id = uuid();
  await client.query(
    `INSERT INTO alerte (id, utilisateur_id, type_alerte, message, equipement_id, soumission_id, statut)
     VALUES ($1,$2,$3,$4,$5,$6,'NON_LUE')`,
    [id, utilisateur_id, type_alerte, message, equipement_id || null, soumission_id || null]
  );
  return id;
}

/** Formulaires maintenance non remplis dans les 24 h (journaliers) */
async function alertesFormulaires24h(client, users) {
  const { rows: forms } = await client.query(
    `SELECT id, code, titre, frequence FROM formulaire_type
     WHERE module = 'MAINTENANCE' AND actif = TRUE AND frequence != 'AU_BESOIN'`
  );

  for (const ft of forms) {
    if (ft.frequence !== 'JOURNALIER') continue;

    const { rows: recent } = await client.query(
      `SELECT MAX(date_soumission) AS derniere
       FROM soumission
       WHERE formulaire_type_id = $1 AND statut IN ('SOUMIS','VALIDE')`,
      [ft.id]
    );
    const derniere = recent[0]?.derniere;
    const enRetard =
      !derniere || new Date(derniere) < new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (!enRetard) continue;

    const msg = `Formulaire « ${ft.titre} » (${ft.code}) non rempli depuis plus de 24 h.`;
    const cibles = users.filter(u =>
      ['Technicien', 'Admin', 'Responsable'].includes(u.role_nom)
    );

    for (const u of cibles) {
      await creerAlerteSiAbsente(client, {
        utilisateur_id: u.id,
        type_alerte: 'FORMULAIRE_EN_RETARD',
        message: msg,
      });
    }
  }
}

/** Pannes critiques depuis interventions / observations maintenanciers */
async function alertesPannesCritiques(client, users) {
  const { rows } = await client.query(
    `SELECT iq.id, iq.cause_indisponibilite, iq.observations,
            iq.duree_arret_effectif, iq.taux_disponibilite_calcule,
            e.nom AS equipement_nom, e.id AS equipement_id, lp.code AS ligne_code
     FROM intervention_quart iq
     JOIN equipement e ON iq.equipement_id = e.id
     LEFT JOIN ligne_production lp ON e.ligne_id = lp.id
     WHERE iq.modifie_le > NOW() - INTERVAL '7 days'`
  );

  const admins = users.filter(u => ['Admin', 'Responsable', 'Technicien'].includes(u.role_nom));

  for (const i of rows) {
    const texte = `${i.cause_indisponibilite || ''} ${i.observations || ''}`;
    const critique =
      PANNE_KEYWORDS.test(texte) ||
      Number(i.duree_arret_effectif) >= 4 ||
      (i.taux_disponibilite_calcule != null && Number(i.taux_disponibilite_calcule) < 70);

    if (!critique) continue;

    const msg = `Panne / indisponibilité critique — ${i.equipement_nom} (${i.ligne_code || 'ligne N/A'}) : ${
      i.cause_indisponibilite || i.observations || `Arrêt ${i.duree_arret_effectif}h`
    }`.slice(0, 450);

    for (const u of admins) {
      await creerAlerteSiAbsente(client, {
        utilisateur_id: u.id,
        type_alerte: 'PANNE_CRITIQUE',
        message: msg,
        equipement_id: i.equipement_id,
      });
    }
  }
}

/** Disponibilité sous cible 90 % (interventions récentes) */
async function alertesDisponibiliteBasse(client, users) {
  const { rows } = await client.query(
    `SELECT il.taux_disponibilite_calcule, lp.code AS ligne_code, il.modifie_le
     FROM intervention_ligne il
     JOIN ligne_production lp ON il.ligne_id = lp.id
     WHERE il.modifie_le > NOW() - INTERVAL '3 days'
       AND il.taux_disponibilite_calcule IS NOT NULL
       AND il.taux_disponibilite_calcule < 90`
  );

  const cibles = users.filter(u => ['Admin', 'Responsable'].includes(u.role_nom));
  for (const r of rows) {
    const msg = `Taux de disponibilité sous la cible (90 %) sur ${r.ligne_code} : ${Number(r.taux_disponibilite_calcule).toFixed(1)}%.`;
    for (const u of cibles) {
      await creerAlerteSiAbsente(client, {
        utilisateur_id: u.id,
        type_alerte: 'MAINTENANCE_PREVENTIVE',
        message: msg,
      });
    }
  }
}

/** Quarts sans maintenancier planifié (7 prochains jours) */
async function alertesPlanningIncomplet(client, users) {
  const { rows } = await client.query(
    `SELECT pj.date_jour, lp.code AS ligne_code, qm.nom AS quart_nom
     FROM planning_jour pj
     JOIN planning_semaine ps ON pj.planning_semaine_id = ps.id
     JOIN ligne_production lp ON ps.ligne_id = lp.id
     JOIN quart_maintenance qm ON TRUE
     WHERE pj.date_jour BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
       AND NOT EXISTS (
         SELECT 1 FROM planning_quart pq
         WHERE pq.planning_jour_id = pj.id AND pq.quart_id = qm.id
       )
     LIMIT 20`
  );

  const cibles = users.filter(u => ['Admin', 'Responsable'].includes(u.role_nom));
  if (!rows.length) return;

  const msg = `${rows.length} créneau(x) de quart sans maintenancier assigné sur les 7 prochains jours (ex. ${rows[0].ligne_code} ${rows[0].date_jour}).`;
  for (const u of cibles) {
    await creerAlerteSiAbsente(client, {
      utilisateur_id: u.id,
      type_alerte: 'MAINTENANCE_PREVENTIVE',
      message: msg,
    });
  }
}

/** Stock pièces sous seuil */
async function alertesStockBas(client, users) {
  const { rows } = await client.query(
    `SELECT p.designation, p.reference, e.nom AS equipement_nom, p.id
     FROM piece_rechange p
     LEFT JOIN equipement e ON p.equipement_id = e.id
     WHERE p.quantite_stock <= p.seuil_alerte AND p.seuil_alerte > 0`
  );

  const cibles = users.filter(u => ['Admin', 'Responsable', 'Technicien'].includes(u.role_nom));
  for (const p of rows) {
    const msg = `Stock bas : ${p.designation} (${p.reference}) — équipement ${p.equipement_nom || 'N/A'}.`;
    for (const u of cibles) {
      await creerAlerteSiAbsente(client, {
        utilisateur_id: u.id,
        type_alerte: 'STOCK_BAS',
        message: msg,
        equipement_id: p.equipement_id,
      });
    }
  }
}

/**
 * Génère les alertes maintenance pour tous les utilisateurs concernés.
 */
async function synchroniserAlertesMaintenance() {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const users = await getUtilisateursCibles(client);
    await alertesFormulaires24h(client, users);
    await alertesPannesCritiques(client, users);
    await alertesDisponibiliteBasse(client, users);
    await alertesPlanningIncomplet(client, users);
    await alertesStockBas(client, users);
    await client.query('COMMIT');
    return { ok: true };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { synchroniserAlertesMaintenance };
