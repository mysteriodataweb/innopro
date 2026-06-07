const r = require('express').Router();
const c = require('../controllers/formulaire.controller');
const { auth, peutGerer, adminSeulement } = require('../middleware/auth');
// Formulaires
r.get('/',     auth, c.lister);
r.get('/:id',  auth, c.getUn);
r.post('/',    auth, peutGerer, c.creer);
r.put('/:id',  auth, peutGerer, c.modifier);
r.delete('/:id', auth, adminSeulement, c.supprimer);
r.get('/:id/schema', auth, c.getSchema);
r.put('/:id/schema', auth, peutGerer, c.enregistrerSchema);
r.post('/:id/generer-depuis-tableur', auth, peutGerer, c.genererDepuisTableur);
r.post('/:id/importer-schema', auth, peutGerer, c.importerSchema);
r.post('/:id/prompt-ia', auth, peutGerer, c.modifierDepuisPrompt);
// Champs d'un formulaire
r.post('/:id/champs',               auth, peutGerer, c.ajouterChamp);
r.put('/:id/champs/:champId',       auth, peutGerer, c.modifierChamp);
r.delete('/:id/champs/:champId',    auth, peutGerer, c.supprimerChamp);
r.put('/:id/champs/reordonner',     auth, peutGerer, c.reordonnerChamps);
module.exports = r;
