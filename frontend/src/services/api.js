import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('if_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('if_token');
    localStorage.removeItem('if_user');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

export const authAPI = {
  login:  d => api.post('/auth/login', d),
  me:     ()  => api.get('/auth/me'),
  chgPwd: d => api.put('/auth/change-password', d),
};

export const formulairesAPI = {
  lister:          p => api.get('/formulaires', { params: p }),
  getUn:           id => api.get(`/formulaires/${id}`),
  creer:           d => api.post('/formulaires', d),
  modifier:        (id,d) => api.put(`/formulaires/${id}`, d),
  supprimer:       id => api.delete(`/formulaires/${id}`),
  schema:          id => api.get(`/formulaires/${id}/schema`),
  sauverSchema:    (id,d) => api.put(`/formulaires/${id}/schema`, d),
  genererTableur:  (id,d) => api.post(`/formulaires/${id}/generer-depuis-tableur`, d),
  importerSchema:  (id,d) => api.post(`/formulaires/${id}/importer-schema`, d),
  promptIA:        (id,d) => api.post(`/formulaires/${id}/prompt-ia`, d),
  ajouterChamp:    (id,d) => api.post(`/formulaires/${id}/champs`, d),
  modifierChamp:   (id,cid,d) => api.put(`/formulaires/${id}/champs/${cid}`, d),
  supprimerChamp:  (id,cid) => api.delete(`/formulaires/${id}/champs/${cid}`),
  reordonner:      (id,d) => api.put(`/formulaires/${id}/champs/reordonner`, d),
  typesChamps:     () => api.get('/champs/types'),
};

export const soumissionsAPI = {
  lister:  p   => api.get('/soumissions', { params: p }),
  getUne:  id  => api.get(`/soumissions/${id}`),
  creer:   d   => api.post('/soumissions', d),
  valider: (id,d) => api.patch(`/soumissions/${id}/statut`, d),
  sync:    d   => api.post('/soumissions/sync', d),
};

export const equipementsAPI = {
  lister:   p     => api.get('/equipements', { params: p }),
  getUn:    id    => api.get(`/equipements/${id}`),
  creer:    d     => api.post('/equipements', d),
  modifier: (id,d)=> api.put(`/equipements/${id}`, d),
};

export const alertesAPI = {
  lister:      p  => api.get('/alertes', { params: p }),
  synchroniser: () => api.get('/alertes', { params: { sync: 'true' } }),
  marquer:     (id,d) => api.patch(`/alertes/${id}`, d),
  toutesLues:  () => api.patch('/alertes/toutes/lues'),
};

export const stockAPI = {
  pieces:      p  => api.get('/stock/pieces', { params: p }),
  creerPiece:  d  => api.post('/stock/pieces', d),
  mouvement:   d  => api.post('/stock/pieces/mouvement', d),
  historique:  id => api.get(`/stock/pieces/${id}/mouvements`),
};

export const planningAPI = {
  // ── PLANNING SEMAINE / MOIS ──────────────────────────
  creerOuRecupererPlanningSemaine: d  => api.post('/planning/semaine/creer-ou-recuperer', d),
  obtenirPlanningSemaine:          id => api.get(`/planning/semaine/${id}`),
  obtenirPlanningMois:             p  => api.get('/planning/mois', { params: p }),
  listerSemainesPlanifiees:        p  => api.get('/planning/semaines/lister', { params: p }),
  listerHistorique:                p  => api.get('/planning/historique', { params: p }),

  // ── ASSIGNATION QUARTS ───────────────────────────────
  assignerMaintenancierQuart:      d  => api.post('/planning/quart/assigner', d),

  // ── INTERVENTIONS ────────────────────────────────────
  creerOuModifierIntervention:     d  => api.post('/planning/intervention/creer-ou-modifier', d),
  mettreAJourInterventionLigne:    d  => api.put('/planning/intervention-ligne', d),
  supprimerPlanningQuart:          id => api.delete(`/planning/quart/${id}`),
  supprimerIntervention:           id => api.delete(`/planning/intervention/${id}`),

  // ── DASHBOARD & STATISTIQUES ──────────────────────────
  dashboardMaintenanceMensuel:     p  => api.get('/planning/dashboard/mensuel', { params: p }),
  dashboardSynthese:               p  => api.get('/planning/dashboard/synthese', { params: p }),
  dashboardGraphiques:           p  => api.get('/planning/dashboard/graphiques', { params: p }),
  suiviEquipementMaintenance:      p  => api.get('/planning/suivi/equipements', { params: p }),
  suiviEquipementsParLigne:        p  => api.get('/planning/suivi/equipements-par-ligne', { params: p }),
  enregistrerSuiviAction:          d  => api.post('/planning/suivi/action', d),
  graphiqueEvolutionMaintenance:   p  => api.get('/planning/graphique/evolution', { params: p }),

  // ── UTILITAIRES ────────────────────────────────────
  listerLignes:                    () => api.get('/planning/lignes/lister'),
  listerQuarts:                    () => api.get('/planning/quarts/lister'),
  listerMaintenanciers:            () => api.get('/planning/maintenanciers/lister'),

  // Anciennes méthodes (rétro-compatibilité)
  lister:  p     => api.get('/planning', { params: p }),
  creer:   d     => api.post('/planning', d),
  statut:  (id,d)=> api.patch(`/planning/${id}/statut`, d),
};

export const utilisateursAPI = {
  lister:      () => api.get('/utilisateurs'),
  roles:       () => api.get('/utilisateurs/roles'),
  creer:       d  => api.post('/utilisateurs', d),
  toggleActif: id => api.patch(`/utilisateurs/${id}/actif`),
  modifierRole:(id,d)=> api.patch(`/utilisateurs/${id}/role`, d),
};

export const dashboardAPI = {
  stats:    () => api.get('/dashboard/stats'),
  activite: () => api.get('/dashboard/activite'),
  retard:   () => api.get('/dashboard/retard'),
  kpi:      () => api.get('/dashboard/kpi'),
};

export default api;
