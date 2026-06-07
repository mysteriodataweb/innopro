const r = require('express').Router();
const c = require('../controllers/planning.controller');
const { auth, peutGerer } = require('../middleware/auth');

// ── PLANNING SEMAINE ─────────────────────────────────
r.post('/semaine/creer-ou-recuperer',   auth, peutGerer, c.creerOuRecupererPlanningSemaine);
r.get('/semaine/:planningSemaineId',    auth, c.obtenirPlanningSemaine);
r.get('/semaines/lister',               auth, c.listerSemainesPlanifiees);
r.get('/mois',                          auth, c.obtenirPlanningMois);
r.get('/historique',                    auth, c.listerHistorique);

// ── ASSIGNATION QUARTS ──────────────────────────────
r.post('/quart/assigner',                auth, peutGerer, c.assignerMaintenancierQuart);

// ── INTERVENTIONS MAINTENANCE ────────────────────────
r.post('/intervention/creer-ou-modifier', auth, c.creerOuModifierIntervention);
r.put('/intervention-ligne',            auth, peutGerer, c.mettreAJourInterventionLigne);
r.delete('/quart/:planningQuartId',     auth, peutGerer, c.supprimerPlanningQuart);
r.delete('/intervention/:interventionId', auth, peutGerer, c.supprimerIntervention);

// ── DASHBOARD & STATISTIQUES ──────────────────────────
r.get('/dashboard/mensuel',              auth, c.dashboardMaintenanceMensuel);
r.get('/dashboard/synthese',             auth, c.dashboardSynthese);
r.get('/dashboard/graphiques',           auth, c.dashboardGraphiques);
r.get('/suivi/equipements',              auth, c.suiviEquipementMaintenance);
r.get('/suivi/equipements-par-ligne',    auth, c.suiviEquipementsParLigne);
r.post('/suivi/action',                  auth, peutGerer, c.enregistrerSuiviAction);
r.get('/graphique/evolution',            auth, c.graphiqueEvolutionMaintenance);

// ── UTILITAIRES ───────────────────────────────────────
r.get('/lignes/lister',                  auth, c.listerLignes);
r.get('/quarts/lister',                  auth, c.listerQuarts);
r.get('/maintenanciers/lister',          auth, c.listerMaintenanciers);

module.exports = r;
