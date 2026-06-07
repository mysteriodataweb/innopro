import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formulairesAPI } from '../services/api';
import { useAuth } from '../store/auth';
import toast from 'react-hot-toast';
import { Search, Plus, FilePlus, Settings, Clock, X, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const freqBadge = {
  JOURNALIER:'badge-blue', HEBDO:'badge-green', MENSUEL:'badge-yellow',
  TRIMESTRIEL:'badge-orange', SEMESTRIEL:'badge-red', ANNUEL:'badge-gray', AU_BESOIN:'badge-purple'
};

const FREQUENCES = ['JOURNALIER','HEBDO','MENSUEL','TRIMESTRIEL','SEMESTRIEL','ANNUEL','AU_BESOIN'];
const MODULES    = ['MAINTENANCE','PRODUCTION'];

function ModalCreer({ onClose, onCreated }) {
  const [form, setForm] = useState({ code:'', titre:'', module:'MAINTENANCE', frequence:'MENSUEL' });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const submit = async e => {
    e.preventDefault();
    if (!form.code || !form.titre) return toast.error('Code et titre requis');
    setLoading(true);
    try {
      const { data } = await formulairesAPI.creer(form);
      toast.success('Formulaire créé !');
      onCreated(data.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-bold">Nouveau formulaire</h3>
          <button onClick={onClose}><X size={18} className="text-gray-500"/></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label-req">Code</label>
            <input value={form.code} onChange={e => set('code', e.target.value)}
              placeholder="ex: PS-ME-EN-NVF-A" className="input font-mono"/>
            <p className="text-xs text-gray-400 mt-1">Identifiant unique du formulaire</p>
          </div>
          <div>
            <label className="label-req">Titre</label>
            <input value={form.titre} onChange={e => set('titre', e.target.value)}
              placeholder="ex: Enregistrement journalier..." className="input"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-req">Module</label>
              <select value={form.module} onChange={e => set('module', e.target.value)} className="select">
                {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label-req">Fréquence</label>
              <select value={form.frequence} onChange={e => set('frequence', e.target.value)} className="select">
                {FREQUENCES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Création…' : 'Créer et configurer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FormulaireListPage() {
  const { peutGerer, moduleScope, isAdmin } = useAuth();
  const canManage = peutGerer();
  const navigate = useNavigate();
  const [formulaires, setFormulaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [module, setModule] = useState(isAdmin() && moduleScope ? moduleScope : '');
  const [frequence, setFrequence] = useState('');
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    formulairesAPI.lister({ search: search||undefined, module: module||undefined, frequence: frequence||undefined, actif: true })
      .then(r => setFormulaires(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, module, frequence]);

  const grouped = formulaires.reduce((acc, f) => {
    if (!acc[f.module]) acc[f.module] = [];
    acc[f.module].push(f); return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {showModal && (
        <ModalCreer
          onClose={() => setShowModal(false)}
          onCreated={id => { setShowModal(false); navigate(`/formulaires/${id}/builder`); }}
        />
      )}

      {/* Filtres */}
      <div className="card flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="input pl-11"/>
        </div>
        <select value={module} onChange={e => setModule(e.target.value)} className="select w-auto">
          <option value="">Tous les modules</option>
          {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={frequence} onChange={e => setFrequence(e.target.value)} className="select w-auto">
          <option value="">Toutes fréquences</option>
          {FREQUENCES.map(f => <option key={f} value={f}>{f.charAt(0)+f.slice(1).toLowerCase()}</option>)}
        </select>
        {canManage && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16}/> Nouveau formulaire
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <p>Aucun formulaire trouvé</p>
        </div>
      ) : Object.entries(grouped).map(([mod, items]) => (
        <div key={mod}>
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className={mod === 'MAINTENANCE' ? 'badge-blue' : 'badge-green'}>{mod}</span>
            <span className="text-sm font-body font-normal text-gray-400">{items.length} formulaire{items.length>1?'s':''}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map(f => (
              <div key={f.id} className="card hover:shadow-float transition-shadow group relative">
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-xs bg-primary/5 text-primary px-2 py-1 rounded-lg">{f.code}</span>
                  <span className={freqBadge[f.frequence]||'badge-gray'}>{f.frequence}</span>
                </div>
                <h4 className="font-medium text-gray-800 text-sm leading-snug mb-3 line-clamp-2">{f.titre}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <span className="badge-gray">{f.nb_champs} champ{+f.nb_champs>1?'s':''}</span>
                  {f.derniere_soumission && (
                    <span className="flex items-center gap-1">
                      <Clock size={11}/>
                      {formatDistanceToNow(new Date(f.derniere_soumission),{addSuffix:true,locale:fr})}
                    </span>
                  )}
                </div>
                <div className={`grid gap-2 ${canManage ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  <Link to={`/formulaires/${f.id}/remplir`}
                    className="btn-primary text-xs py-2 flex items-center justify-center gap-1.5">
                    <FilePlus size={14}/> Remplir
                  </Link>
                  {canManage && (
                    <Link to={`/formulaires/${f.id}/builder`}
                      className="btn-secondary text-xs py-2 flex items-center justify-center gap-1.5">
                      <Settings size={14}/> Configurer
                    </Link>
                  )}
                  <Link to={`/historique?formulaire_id=${f.id}&module=${f.module}`}
                    className="btn-ghost text-xs py-2 flex items-center justify-center gap-1.5">
                    <History size={14}/> Historique
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
