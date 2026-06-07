import { useState, useEffect } from 'react';
import { stockAPI, equipementsAPI } from '../services/api';
import { useAuth } from '../store/auth';
import toast from 'react-hot-toast';
import { Search, Plus, Minus, AlertTriangle, X } from 'lucide-react';

export default function StockPage() {
  const { peutGerer } = useAuth();
  const [pieces, setPieces] = useState([]);
  const [search, setSearch] = useState('');
  const [alerteOnly, setAlerteOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [qty, setQty] = useState('');
  const [motif, setMotif] = useState('');

  const load = () => {
    setLoading(true);
    stockAPI.pieces({ search:search||undefined, alerte_stock:alerteOnly||undefined })
      .then(r=>setPieces(r.data)).catch(console.error).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[search,alerteOnly]);

  const handleMvt = async () => {
    if (!qty||isNaN(qty)||+qty<=0) return toast.error('Quantité invalide');
    try {
      await stockAPI.mouvement({ piece_id:modal.piece.id, type_mouvement:modal.type, quantite:+qty, motif });
      toast.success(modal.type==='ENTREE'?'Entrée enregistrée !':'Sortie enregistrée !');
      setModal(null); setQty(''); setMotif(''); load();
    } catch(err) { toast.error(err.response?.data?.error||'Erreur'); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {modal && (
        <div className="modal-overlay"><div className="modal max-w-sm p-6">
          <h3 className="font-display text-lg font-bold mb-1">{modal.type==='ENTREE'?'📦 Entrée':'📤 Sortie'} stock</h3>
          <p className="text-sm text-gray-500 mb-4">{modal.piece.designation}</p>
          <div className="space-y-3">
            <div><label className="label-req">Quantité</label>
              <input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} className="input" placeholder="0"/></div>
            <div><label className="label">Motif</label>
              <input value={motif} onChange={e=>setMotif(e.target.value)} className="input" placeholder="Raison du mouvement…"/></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={()=>setModal(null)} className="btn-secondary flex-1">Annuler</button>
            <button onClick={handleMvt} className={modal.type==='ENTREE'?'btn-primary flex-1':'btn-danger flex-1'}>Confirmer</button>
          </div>
        </div></div>
      )}

      <div className="card flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input placeholder="Rechercher une pièce…" value={search} onChange={e=>setSearch(e.target.value)} className="input pl-11"/>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={alerteOnly} onChange={e=>setAlerteOnly(e.target.checked)} className="w-4 h-4 accent-primary"/>
          <span className="text-sm text-gray-600 flex items-center gap-1"><AlertTriangle size={14} className="text-orange-500"/>Stock bas uniquement</span>
        </label>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="th">Pièce</th><th className="th">Référence</th>
              <th className="th">Équipement</th><th className="th text-right">Stock</th>
              <th className="th text-right">Seuil</th>
              {<th className="th text-center">Mouvements</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
            : pieces.length===0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Aucune pièce trouvée</td></tr>
            : pieces.map(p=>{
              const bas = +p.quantite_stock <= +p.seuil_alerte;
              return (
                <tr key={p.id} className={`tr ${bas?'bg-red-50/30':''}`}>
                  <td className="td"><p className="font-medium text-sm text-gray-800">{p.designation}</p><p className="text-xs text-gray-400">{p.equipement_nom}</p></td>
                  <td className="td font-mono text-xs text-gray-500">{p.reference}</td>
                  <td className="td text-xs text-gray-400">{p.equipement_nom||'—'}</td>
                  <td className="td text-right">
                    <span className={`font-bold text-sm ${bas?'text-red-600':'text-gray-800'}`}>
                      {bas&&<AlertTriangle size={13} className="inline mr-1 text-red-500"/>}
                      {p.quantite_stock} {p.unite}
                    </span>
                  </td>
                  <td className="td text-right text-sm text-gray-400">{p.seuil_alerte} {p.unite}</td>
                  <td className="td text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={()=>setModal({piece:p,type:'ENTREE'})} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Entrée"><Plus size={14}/></button>
                      <button onClick={()=>setModal({piece:p,type:'SORTIE'})} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Sortie"><Minus size={14}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
