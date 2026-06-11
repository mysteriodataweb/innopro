import { useState, useEffect } from 'react';
import { equipementsAPI } from '../services/api';
import { useAuth } from '../store/auth';
import toast from 'react-hot-toast';
import { Search, Plus, Wrench, MapPin, X, Edit, Trash2, Filter } from 'lucide-react';

function Modal({ onClose, onCreated, equipment = null }) {
  const [f, setF] = useState(equipment || { code_ref:'', nom:'', type_equipement:'', localisation:'', ligne_production:'', etat:'OPERATIONNEL' });
  const [l, setL] = useState(false);
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  const sub = async e => {
    e.preventDefault();
    if (!f.code_ref||!f.nom) return toast.error('Code et nom requis');
    setL(true);
    try { 
      if (equipment) {
        await equipementsAPI.modifier(equipment.id, f);
        toast.success('Équipement modifié !');
      } else {
        await equipementsAPI.creer(f);
        toast.success('Équipement créé !');
      }
      onCreated(); 
    }
    catch(err) { toast.error(err.response?.data?.error||'Erreur'); }
    finally { setL(false); }
  };
  return (
    <div className="modal-overlay"><div className="modal max-w-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold">{equipment ? 'Modifier' : 'Nouvel équipement'}</h3>
        <button onClick={onClose}><X size={18} className="text-gray-500"/></button>
      </div>
      <form onSubmit={sub} className="space-y-3">
        {[['code_ref','Code référence *','ex: BROYEUR-01','font-mono'],['nom','Nom *','Nom de l\'équipement',''],['type_equipement','Type','Broyeur, Pompe...',''],['localisation','Localisation','Salle de production',''],['ligne_production','Ligne de production','Ligne 1','']].map(([k,l,p,cls])=>(
          <div key={k}><label className="label">{l}</label>
            <input value={f[k]} onChange={e=>s(k,e.target.value)} placeholder={p} className={`input ${cls}`}/>
          </div>
        ))}
        <div>
          <label className="label">État</label>
          <select value={f.etat} onChange={e=>s('etat',e.target.value)} className="input">
            <option value="OPERATIONNEL">Opérationnel</option>
            <option value="EN_PANNE">En panne</option>
            <option value="EN_MAINTENANCE">En maintenance</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button type="submit" disabled={l} className="btn-primary flex-1">{l?'Enregistrement…':(equipment?'Modifier':'Créer')}</button>
        </div>
      </form>
    </div></div>
  );
}

export default function EquipementsPage() {
  const { peutGerer } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editEquipment, setEditEquipment] = useState(null);
  const [stats, setStats] = useState({ total: 0, operational: 0, faulty: 0, maintenance: 0 });

  const load = () => {
    setLoading(true);
    equipementsAPI.lister({ search: search||undefined, type: filterType||undefined })
      .then(r => {
        setItems(r.data);
        const total = r.data.length;
        const operational = r.data.filter(e => e.etat === 'OPERATIONNEL').length;
        const faulty = r.data.filter(e => e.etat === 'EN_PANNE').length;
        const maintenance = r.data.filter(e => e.etat === 'EN_MAINTENANCE').length;
        setStats({ total, operational, faulty, maintenance });
      })
      .catch(console.error)
      .finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[search, filterType]);

  const handleDelete = async id => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) return;
    try {
      await equipementsAPI.supprimer(id);
      toast.success('Équipement supprimé');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const etatColor = { OPERATIONNEL:'badge-green', EN_PANNE:'badge-red', EN_MAINTENANCE:'badge-yellow' };

  const filteredItems = filterStatus ? items.filter(e => e.etat === filterStatus) : items;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {modal && <Modal onClose={()=>{setModal(false);setEditEquipment(null);}} onCreated={()=>{setModal(false);setEditEquipment(null);load();}} equipment={editEquipment}/>}
      
      <div className="card space-y-4">
        <h1 className="text-2xl font-bold">Gestion des équipements</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">Opérationnels</p>
            <p className="text-2xl font-bold text-green-600">{stats.operational}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">En panne</p>
            <p className="text-2xl font-bold text-red-600">{stats.faulty}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-muted-foreground">En maintenance</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} className="input pl-11"/>
          </div>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)} className="input w-40">
            <option value="">Tous types</option>
            {[...new Set(items.map(e => e.type_equipement).filter(Boolean))].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="input w-40">
            <option value="">Tous états</option>
            <option value="OPERATIONNEL">Opérationnel</option>
            <option value="EN_PANNE">En panne</option>
            <option value="EN_MAINTENANCE">En maintenance</option>
          </select>
          {peutGerer() && <button onClick={()=>setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16}/> Ajouter</button>}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Localisation</th>
                <th className="px-4 py-3">Ligne</th>
                <th className="px-4 py-3">État</th>
                {peutGerer() && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(e=>(
                <tr key={e.id} className="border-b border-border/60 hover:bg-primary/[0.03]">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{e.code_ref}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 text-sm">{e.nom}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{e.type_equipement||'—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 flex items-center gap-1"><MapPin size={11}/>{e.localisation||'—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{e.ligne_production||'—'}</td>
                  <td className="px-4 py-3"><span className={`mt-3 inline-flex ${etatColor[e.etat]||'badge-gray'}`}>{e.etat?.replace('_',' ')}</span></td>
                  {peutGerer() && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={()=>{setEditEquipment(e);setModal(true);}} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg" title="Modifier"><Edit size={16}/></button>
                        <button onClick={()=>handleDelete(e.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">Aucun équipement trouvé</div>
          )}
        </div>
      )}
    </div>
  );
}
