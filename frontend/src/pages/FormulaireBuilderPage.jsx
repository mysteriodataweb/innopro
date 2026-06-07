import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formulairesAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Edit3,
  Save, X, ChevronDown, ChevronUp, Settings, Eye
} from 'lucide-react';

const TYPE_LABELS = {
  TEXTE:'Texte libre', NOMBRE:'Nombre', DATE:'Date', HEURE:'Heure',
  BOOLEEN:'Oui / Non', LISTE:'Liste de choix', SIGNATURE:'Signature',
  CALCULE:'Calculé', PHOTO:'Photo'
};

const TYPE_COLORS = {
  TEXTE:'badge-gray', NOMBRE:'badge-blue', DATE:'badge-purple',
  HEURE:'badge-purple', BOOLEEN:'badge-green', LISTE:'badge-orange',
  SIGNATURE:'badge-red', CALCULE:'badge-yellow', PHOTO:'badge-gray'
};

const FREQUENCES = ['JOURNALIER','HEBDO','MENSUEL','TRIMESTRIEL','SEMESTRIEL','ANNUEL','AU_BESOIN'];
const MODULES = ['MAINTENANCE','PRODUCTION'];

// ── Modal pour créer / modifier un champ ─────────────────────
function ModalChamp({ champ, formulaireId, onSave, onClose }) {
  const editing = !!champ?.id;
  const [form, setForm] = useState({
    nom_champ: champ?.nom_champ || '',
    type_champ: champ?.type_champ || 'TEXTE',
    section: champ?.section || 'Général',
    obligatoire: champ?.obligatoire || false,
    unite: champ?.unite || '',
    options_liste: champ?.options_liste
      ? (Array.isArray(champ.options_liste) ? champ.options_liste.join('\n') : JSON.parse(champ.options_liste).join('\n'))
      : '',
    ordre: champ?.ordre || 0,
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    if (!form.nom_champ.trim()) return toast.error('Nom du champ requis');
    if (form.type_champ === 'LISTE' && !form.options_liste.trim())
      return toast.error('Les options sont requises pour un champ de type Liste');
    setLoading(true);
    try {
      const payload = {
        nom_champ: form.nom_champ.trim(),
        type_champ: form.type_champ,
        section: form.section.trim() || 'Général',
        obligatoire: form.obligatoire,
        unite: form.unite.trim() || null,
        ordre: form.ordre || undefined,
        options_liste: form.type_champ === 'LISTE'
          ? form.options_liste.split('\n').map(s => s.trim()).filter(Boolean)
          : null,
      };
      if (editing) {
        await formulairesAPI.modifierChamp(formulaireId, champ.id, payload);
        toast.success('Champ modifié !');
      } else {
        await formulairesAPI.ajouterChamp(formulaireId, payload);
        toast.success('Champ ajouté !');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-bold text-gray-900">
            {editing ? 'Modifier le champ' : 'Ajouter un champ'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-500"/>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label-req">Nom du champ</label>
              <input value={form.nom_champ} onChange={e => set('nom_champ', e.target.value)}
                placeholder="ex: Niveau d'huile moteur" className="input"/>
            </div>

            <div>
              <label className="label-req">Type de champ</label>
              <select value={form.type_champ} onChange={e => set('type_champ', e.target.value)} className="select">
                {Object.entries(TYPE_LABELS).map(([k,v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Section</label>
              <input value={form.section} onChange={e => set('section', e.target.value)}
                placeholder="ex: Contrôle" className="input"/>
            </div>

            {form.type_champ === 'NOMBRE' && (
              <div>
                <label className="label">Unité</label>
                <input value={form.unite} onChange={e => set('unite', e.target.value)}
                  placeholder="ex: Bar, kg, °C" className="input"/>
              </div>
            )}

            <div>
              <label className="label">Ordre</label>
              <input type="number" min="0" value={form.ordre}
                onChange={e => set('ordre', +e.target.value)} className="input"/>
            </div>
          </div>

          {form.type_champ === 'LISTE' && (
            <div>
              <label className="label-req">Options (une par ligne)</label>
              <textarea value={form.options_liste} onChange={e => set('options_liste', e.target.value)}
                rows={5} placeholder={"OK\nNOK\nN/A"} className="input resize-none font-mono text-sm"/>
              <p className="text-xs text-gray-400 mt-1">Chaque ligne = une option de la liste</p>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <input type="checkbox" checked={form.obligatoire} onChange={e => set('obligatoire', e.target.checked)}
              className="w-4 h-4 accent-primary"/>
            <div>
              <p className="text-sm font-medium text-gray-800">Champ obligatoire</p>
              <p className="text-xs text-gray-400">La soumission sera bloquée si ce champ est vide</p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Enregistrement…
                  </span>
                : editing ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal pour modifier les infos du formulaire ───────────────
function ModalInfos({ formulaire, onSave, onClose }) {
  const [form, setForm] = useState({
    titre: formulaire.titre, code: formulaire.code,
    module: formulaire.module, frequence: formulaire.frequence,
  });
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await formulairesAPI.modifier(formulaire.id, form);
      toast.success('Formulaire mis à jour !');
      onSave();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-bold">Modifier le formulaire</h3>
          <button onClick={onClose}><X size={18} className="text-gray-500"/></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label-req">Code</label>
            <input value={form.code} onChange={e => setForm(p=>({...p,code:e.target.value}))} className="input font-mono"/>
          </div>
          <div>
            <label className="label-req">Titre</label>
            <input value={form.titre} onChange={e => setForm(p=>({...p,titre:e.target.value}))} className="input"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-req">Module</label>
              <select value={form.module} onChange={e => setForm(p=>({...p,module:e.target.value}))} className="select">
                {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label-req">Fréquence</label>
              <select value={form.frequence} onChange={e => setForm(p=>({...p,frequence:e.target.value}))} className="select">
                {FREQUENCES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Enregistrement…' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Ligne d'un champ dans le builder ─────────────────────────
function ChampRow({ champ, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return; }
    onDelete(champ.id);
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-primary/30 hover:shadow-sm transition-all group">
      {/* Drag handle (visuel) */}
      <GripVertical size={18} className="text-gray-300 flex-shrink-0 cursor-grab"/>

      {/* Infos champ */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-800">{champ.nom_champ}</span>
          {champ.obligatoire && (
            <span className="text-red-500 text-xs font-semibold">• Obligatoire</span>
          )}
          <span className={TYPE_COLORS[champ.type_champ] || 'badge-gray'}>
            {TYPE_LABELS[champ.type_champ] || champ.type_champ}
          </span>
          {champ.unite && (
            <span className="text-xs text-gray-400 font-mono">({champ.unite})</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-400">Section : <span className="font-medium text-gray-600">{champ.section}</span></span>
          <span className="text-xs text-gray-400">Ordre : {champ.ordre}</span>
          {champ.options_liste && (
            <span className="text-xs text-gray-400">
              {(Array.isArray(champ.options_liste) ? champ.options_liste : JSON.parse(champ.options_liste)).length} option(s)
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onMoveUp(champ.id)} disabled={isFirst}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <ChevronUp size={15} className="text-gray-500"/>
        </button>
        <button onClick={() => onMoveDown(champ.id)} disabled={isLast}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <ChevronDown size={15} className="text-gray-500"/>
        </button>
        <button onClick={() => onEdit(champ)}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
          <Edit3 size={15}/>
        </button>
        <button onClick={handleDelete}
          className={`p-1.5 rounded-lg transition-colors ${confirm ? 'bg-red-500 text-white' : 'hover:bg-red-50 text-red-500'}`}
          title={confirm ? 'Cliquer encore pour confirmer' : 'Supprimer'}>
          <Trash2 size={15}/>
        </button>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function FormulaireBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formulaire, setFormulaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalChamp, setModalChamp] = useState(null);   // null | {} (nouveau) | {champ} (édition)
  const [showModalInfos, setShowModalInfos] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await formulairesAPI.getUn(id);
      setFormulaire(data);
    } catch { toast.error('Erreur de chargement'); navigate('/formulaires'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleDeleteChamp = async champId => {
    try {
      await formulairesAPI.supprimerChamp(id, champId);
      toast.success('Champ supprimé');
      load();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const handleMove = async (champId, direction) => {
    const champs = [...(formulaire.champs || [])];
    const idx = champs.findIndex(c => c.id === champId);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === champs.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    // Échanger les ordres
    const newChamps = champs.map((c, i) => {
      if (i === idx)    return { ...c, ordre: champs[swapIdx].ordre };
      if (i === swapIdx) return { ...c, ordre: champs[idx].ordre };
      return c;
    });
    setSaving(true);
    try {
      await formulairesAPI.reordonner(id, newChamps.map(c => ({ id: c.id, ordre: c.ordre })));
      setFormulaire(prev => ({
        ...prev,
        champs: newChamps.sort((a,b) => a.ordre - b.ordre)
      }));
    } catch { toast.error('Erreur de réordonnancement'); }
    finally { setSaving(false); }
  };

  // Grouper les champs par section
  const sections = formulaire?.champs?.reduce((acc, c) => {
    const s = c.section || 'Général';
    if (!acc[s]) acc[s] = [];
    acc[s].push(c);
    return acc;
  }, {}) || {};

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Modals */}
      {modalChamp !== null && (
        <ModalChamp
          champ={modalChamp.id ? modalChamp : null}
          formulaireId={id}
          onSave={() => { setModalChamp(null); load(); }}
          onClose={() => setModalChamp(null)}
        />
      )}
      {showModalInfos && (
        <ModalInfos
          formulaire={formulaire}
          onSave={() => { setShowModalInfos(false); load(); }}
          onClose={() => setShowModalInfos(false)}
        />
      )}

      {/* En-tête */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/formulaires')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors mt-0.5">
          <ArrowLeft size={20} className="text-gray-600"/>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-xs bg-primary/5 text-primary px-2 py-1 rounded-lg">{formulaire.code}</span>
            <span className={formulaire.module === 'MAINTENANCE' ? 'badge-blue' : 'badge-green'}>{formulaire.module}</span>
            <span className="badge-gray">{formulaire.frequence}</span>
            {saving && <span className="text-xs text-gray-400 animate-pulse">Enregistrement…</span>}
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 leading-tight">{formulaire.titre}</h1>
          <p className="text-gray-500 text-sm mt-1">{formulaire.champs?.length || 0} champ(s) défini(s)</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setShowModalInfos(true)}
            className="btn-secondary flex items-center gap-2 text-sm px-4 py-2">
            <Settings size={16}/> Modifier infos
          </button>
          <Link to={`/formulaires/${id}/remplir`}
            className="btn-ghost flex items-center gap-2 text-sm px-4 py-2">
            <Eye size={16}/> Aperçu
          </Link>
          <button onClick={() => setModalChamp({})}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
            <Plus size={16}/> Ajouter un champ
          </button>
        </div>
      </div>

      {/* Champs par section */}
      {Object.keys(sections).length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus size={28} className="text-primary"/>
          </div>
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">Aucun champ défini</h3>
          <p className="text-gray-400 text-sm mb-6">Commencez par ajouter des champs à ce formulaire</p>
          <button onClick={() => setModalChamp({})} className="btn-primary mx-auto flex items-center gap-2">
            <Plus size={16}/> Ajouter le premier champ
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(sections).map(([section, champs]) => (
            <div key={section} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title mb-0">{section}</h3>
                <span className="text-xs text-gray-400">{champs.length} champ{champs.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {champs.map((champ, i) => (
                  <ChampRow
                    key={champ.id}
                    champ={champ}
                    onEdit={c => setModalChamp(c)}
                    onDelete={handleDeleteChamp}
                    onMoveUp={cid => handleMove(cid, 'up')}
                    onMoveDown={cid => handleMove(cid, 'down')}
                    isFirst={i === 0 && Object.keys(sections)[0] === section}
                    isLast={i === champs.length - 1 && Object.keys(sections).slice(-1)[0] === section}
                  />
                ))}
              </div>
              <button onClick={() => setModalChamp({ section })}
                className="mt-3 w-full border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-gray-400 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2">
                <Plus size={15}/> Ajouter un champ dans "{section}"
              </button>
            </div>
          ))}

          {/* Bouton global */}
          <button onClick={() => setModalChamp({})}
            className="w-full border-2 border-dashed border-primary/20 rounded-2xl py-4 text-sm text-primary/60 hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2">
            <Plus size={16}/> Ajouter une nouvelle section / un nouveau champ
          </button>
        </div>
      )}
    </div>
  );
}
