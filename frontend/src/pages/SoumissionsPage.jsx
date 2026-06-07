import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { soumissionsAPI, formulairesAPI } from '../services/api';
import { useAuth } from '../store/auth';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SC = { VALIDE:'badge-green', SOUMIS:'badge-blue', BROUILLON:'badge-gray' };
const MC = { MAINTENANCE:'badge-blue', PRODUCTION:'badge-green' };
const MODULES = [
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'PRODUCTION', label: 'Production' },
];

export default function SoumissionsPage() {
  const { isAdmin, moduleScope } = useAuth();
  const adminUser = isAdmin();
  const [searchParams] = useSearchParams();
  const initialFormulaireId = searchParams.get('formulaire_id') || searchParams.get('formulaire') || '';
  const initialModule = searchParams.get('module') || '';
  const [data, setData] = useState({ data:[], total:0, totalPages:1 });
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState('');
  const [module, setModule] = useState(initialModule);
  const [formulaireId, setFormulaireId] = useState(initialFormulaireId);
  const [formulaires, setFormulaires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    soumissionsAPI.lister({
      page,
      limit: 15,
      statut: statut || undefined,
      module: module || undefined,
      formulaire_type_id: formulaireId || undefined,
    })
      .then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [page, statut, module, formulaireId]);

  useEffect(() => {
    if (adminUser && moduleScope) {
      setModule(moduleScope);
    }
  }, [adminUser, moduleScope]);

  useEffect(() => {
    formulairesAPI.lister({ actif: true, module: module || undefined })
      .then(r => setFormulaires(r.data || []))
      .catch(() => setFormulaires([]));
  }, [module]);

  useEffect(() => {
    if (!formulaireId) return;
    if (!formulaires.some(f => f.id === formulaireId)) {
      setFormulaireId('');
    }
  }, [formulaires, formulaireId]);

  const moduleLocked = adminUser && moduleScope;
  const handleModuleChange = (value) => {
    setModule(value);
    setFormulaireId('');
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="card flex gap-4 flex-wrap">
        <select
          value={module}
          onChange={e => handleModuleChange(e.target.value)}
          disabled={moduleLocked}
          className="select w-auto disabled:opacity-60"
        >
          {!moduleLocked && <option value="">Tous les modules</option>}
          {MODULES.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          value={formulaireId}
          onChange={e => { setFormulaireId(e.target.value); setPage(1); }}
          className="select min-w-[220px]"
        >
          <option value="">Tous les formulaires</option>
          {formulaires.map(f => (
            <option key={f.id} value={f.id}>[{f.code}] {f.titre}</option>
          ))}
        </select>
        <select value={statut} onChange={e => { setStatut(e.target.value); setPage(1); }} className="select w-auto">
          <option value="">Tous les statuts</option>
          <option value="SOUMIS">Soumis</option>
          <option value="VALIDE">Validé</option>
          <option value="BROUILLON">Brouillon</option>
        </select>
        <p className="text-sm text-gray-400 self-center ml-auto">{data.total} soumission{data.total>1?'s':''}</p>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="th">Formulaire</th>
              <th className="th">Module</th>
              <th className="th">Auteur</th>
              <th className="th">Équipement</th>
              <th className="th">Source</th>
              <th className="th">Statut</th>
              <th className="th">Date</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"/>
                </td></tr>
              : data.data.length === 0
                ? <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Aucune soumission</td></tr>
                : data.data.map(s => (
                  <tr key={s.id} className="tr">
                    <td className="td">
                      <p className="font-medium text-sm">{s.form_code}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">{s.form_titre}</p>
                    </td>
                    <td className="td"><span className={MC[s.module]||'badge-gray'}>{s.module}</span></td>
                    <td className="td text-sm">{s.auteur}</td>
                    <td className="td text-xs text-gray-400">{s.equipement||'—'}</td>
                    <td className="td">
                      <span className={s.source==='HORS_LIGNE' ? 'badge-orange' : 'badge-gray'}>
                        {s.source==='HORS_LIGNE' ? '📱 Hors-ligne' : '🌐 En ligne'}
                      </span>
                    </td>
                    <td className="td"><span className={SC[s.statut]||'badge-gray'}>{s.statut}</span></td>
                    <td className="td text-xs text-gray-400">
                      {format(new Date(s.date_soumission),'dd MMM yyyy',{locale:fr})}
                    </td>
                    <td className="td">
                      <Link to={`/soumissions/${s.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex">
                        <Eye size={16} className="text-gray-500"/>
                      </Link>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="btn-secondary px-3 py-2 disabled:opacity-40">
              <ChevronLeft size={16}/>
            </button>
            <span className="text-sm text-gray-500">Page {page} / {data.totalPages}</span>
            <button disabled={page===data.totalPages} onClick={() => setPage(p=>p+1)} className="btn-secondary px-3 py-2 disabled:opacity-40">
              <ChevronRight size={16}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
