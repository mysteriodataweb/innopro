import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formulairesAPI, soumissionsAPI, equipementsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Send } from 'lucide-react';

const PIVOT_TO_EAV = {
  text: 'TEXTE',
  textarea: 'TEXTE',
  email: 'TEXTE',
  phone: 'TEXTE',
  number: 'NOMBRE',
  currency: 'NOMBRE',
  date: 'DATE',
  time: 'HEURE',
  checkbox: 'BOOLEEN',
  select: 'LISTE',
  file: 'PHOTO',
  signature: 'SIGNATURE',
};

/* Rendu d'un champ selon son type EAV */
function ChampInput({ champ, value, onChange }) {
  const { nom_champ, type_champ, obligatoire, unite, options_liste } = champ;
  const opts = options_liste
    ? (Array.isArray(options_liste) ? options_liste : JSON.parse(options_liste))
    : [];

  const base = 'input';
  const label = (
    <label className={obligatoire ? 'label-req' : 'label'}>
      {nom_champ}{unite && <span className="text-gray-400 font-normal ml-1">({unite})</span>}
    </label>
  );

  if (type_champ === 'TEXTE')
    return <div>{label}<input type="text" value={value||''} onChange={e => onChange(e.target.value)} className={base}/></div>;

  if (type_champ === 'NOMBRE')
    return <div>{label}<input type="number" step="any" value={value||''} onChange={e => onChange(e.target.value)} className={base}/></div>;

  if (type_champ === 'DATE')
    return <div>{label}<input type="date" value={value||''} onChange={e => onChange(e.target.value)} className={base}/></div>;

  if (type_champ === 'HEURE')
    return <div>{label}<input type="time" value={value||''} onChange={e => onChange(e.target.value)} className={base}/></div>;

  if (type_champ === 'BOOLEEN')
    return (
      <div>
        {label}
        <div className="flex gap-3">
          {['Oui','Non'].map(v => (
            <label key={v} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all flex-1 justify-center font-medium text-sm
              ${value === v ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
              <input type="radio" className="hidden" value={v} checked={value===v} onChange={() => onChange(v)}/>
              {v}
            </label>
          ))}
        </div>
      </div>
    );

  if (type_champ === 'LISTE')
    return (
      <div>
        {label}
        <select value={value||''} onChange={e => onChange(e.target.value)} className="select">
          <option value="">— Sélectionner —</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );

  if (type_champ === 'SIGNATURE')
    return (
      <div>
        {label}
        <input type="text" value={value||''} onChange={e => onChange(e.target.value)}
          placeholder="Nom et fonction du signataire" className={base}/>
      </div>
    );

  if (type_champ === 'PHOTO')
    return (
      <div>
        {label}
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
          📷 Fonctionnalité photo disponible sur mobile
        </div>
      </div>
    );

  return <div>{label}<input type="text" value={value||''} onChange={e => onChange(e.target.value)} className={base}/></div>;
}

function PivotFormRenderer({ schema, champs, values, onChange }) {
  const champsById = Object.fromEntries((champs || []).map(champ => [champ.id, champ]));
  const champsByLabel = Object.fromEntries((champs || []).map(champ => [champ.nom_champ, champ]));
  const columns = schema?.layout?.columns || 2;

  const fieldsForSection = section => (schema.fields || [])
    .filter(field => field.position?.row >= section.position?.rowStart && field.position?.row <= section.position?.rowEnd)
    .sort((a, b) => (a.position?.row - b.position?.row) || (a.position?.column - b.position?.column));

  return (
    <>
      {(schema.sections || []).map(section => (
        <fieldset key={section.id || section.title} className="card space-y-5">
          <legend className="section-title w-full" style={{ color: section.color || undefined }}>
            {section.title}
          </legend>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {fieldsForSection(section).map(field => {
              const champ = champsById[field.legacyChampId] || champsByLabel[field.label];
              if (!champ) return null;
              const synthetic = {
                ...champ,
                nom_champ: field.label,
                type_champ: PIVOT_TO_EAV[field.type] || champ.type_champ,
                obligatoire: field.required,
                options_liste: field.options?.length ? field.options : champ.options_liste,
              };
              return (
                <div key={field.id} style={{
                  gridColumn: `span ${Math.min(field.position?.colSpan || 1, columns)}`,
                  color: field.style?.labelColor || undefined,
                  fontWeight: field.style?.bold ? 700 : undefined,
                }}>
                  <ChampInput champ={synthetic} value={values[champ.id]} onChange={val => onChange(champ.id, val)}/>
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}
    </>
  );
}

export default function FormulaireRemplirPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formulaire, setFormulaire] = useState(null);
  const [equipements, setEquipements] = useState([]);
  const [values, setValues] = useState({});   // { champ_def_id: valeur brute }
  const [meta, setMeta] = useState({ equipement_id: '', emetteur_nom: '', emetteur_fonction: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([formulairesAPI.getUn(id), equipementsAPI.lister()])
      .then(([f, e]) => { setFormulaire(f.data); setEquipements(e.data); })
      .catch(() => { toast.error('Erreur de chargement'); navigate('/formulaires'); })
      .finally(() => setLoading(false));
  }, [id]);

  const setVal = (champId, val) => setValues(p => ({ ...p, [champId]: val }));

  /* Construire le payload EAV */
  const buildValeurs = () => {
    return (formulaire?.champs || []).map(c => {
      const raw = values[c.id];
      const entry = { champ_def_id: c.id };
      if (c.type_champ === 'NOMBRE')  entry.valeur_nombre  = raw ? +raw : null;
      else if (c.type_champ === 'DATE')   entry.valeur_date   = raw || null;
      else if (c.type_champ === 'HEURE')  entry.valeur_texte  = raw || null;
      else if (c.type_champ === 'BOOLEEN') entry.valeur_booleen = raw === 'Oui';
      else                                entry.valeur_texte  = raw || null;
      return entry;
    });
  };

  const submit = async e => {
    e.preventDefault();
    // Vérif champs obligatoires
    for (const c of formulaire?.champs || []) {
      if (c.obligatoire && !values[c.id])
        return toast.error(`Champ obligatoire : "${c.nom_champ}"`);
    }
    setSubmitting(true);
    try {
      await soumissionsAPI.creer({
        formulaire_type_id: id,
        equipement_id: meta.equipement_id || null,
        entete: {
          emetteur_nom: meta.emetteur_nom || null,
          emetteur_fonction: meta.emetteur_fonction || null,
          emetteur_date: new Date().toISOString().split('T')[0],
        },
        valeurs: buildValeurs(),
      });
      toast.success('Formulaire soumis avec succès !');
      navigate('/soumissions');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la soumission');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const sections = formulaire?.sections || {};
  const pivotSchema = formulaire?.schema_json?.fields?.length ? formulaire.schema_json : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors mt-0.5">
          <ArrowLeft size={20} className="text-gray-600"/>
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs bg-primary/5 text-primary px-2 py-1 rounded-lg">{formulaire.code}</span>
            <span className={formulaire.module === 'MAINTENANCE' ? 'badge-blue' : 'badge-green'}>{formulaire.module}</span>
            <span className="badge-gray">{formulaire.frequence}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">{formulaire.titre}</h1>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Informations générales */}
        <div className="card space-y-4">
          <h3 className="section-title">Informations générales</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Émetteur</label>
              <input value={meta.emetteur_nom} onChange={e => setMeta(p=>({...p,emetteur_nom:e.target.value}))}
                placeholder="Nom complet" className="input"/>
            </div>
            <div>
              <label className="label">Fonction</label>
              <input value={meta.emetteur_fonction} onChange={e => setMeta(p=>({...p,emetteur_fonction:e.target.value}))}
                placeholder="ex: Technicien" className="input"/>
            </div>
          </div>
          {equipements.length > 0 && (
            <div>
              <label className="label">Équipement concerné</label>
              <select value={meta.equipement_id} onChange={e => setMeta(p=>({...p,equipement_id:e.target.value}))} className="select">
                <option value="">— Aucun équipement spécifique —</option>
                {equipements.map(eq => <option key={eq.id} value={eq.id}>[{eq.code_ref}] {eq.nom}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Champs par section */}
        {pivotSchema ? (
          <PivotFormRenderer schema={pivotSchema} champs={formulaire.champs || []}
            values={values} onChange={setVal}/>
        ) : Object.keys(sections).length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <p>Aucun champ défini pour ce formulaire.</p>
            <p className="text-sm mt-1">Configurez les champs dans le Builder.</p>
          </div>
        ) : Object.entries(sections).map(([section, champs]) => (
          <div key={section} className="card space-y-5">
            <h3 className="section-title">{section}</h3>
            {champs.map(champ => (
              <ChampInput key={champ.id} champ={champ}
                value={values[champ.id]}
                onChange={val => setVal(champ.id, val)}/>
            ))}
          </div>
        ))}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={16}/> Annuler
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 px-8">
            {submitting
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/><span>Envoi…</span></>
              : <><Send size={16}/><span>Soumettre</span></>}
          </button>
        </div>
      </form>
    </div>
  );
}
