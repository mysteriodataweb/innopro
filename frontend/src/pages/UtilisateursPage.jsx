import { useState, useEffect } from 'react';
import { utilisateursAPI } from '../services/api';
import { useAuth } from '../store/auth';
import toast from 'react-hot-toast';
import { UserPlus, UserCheck, UserX, X } from 'lucide-react';

const RC = { Admin:'badge-red', Responsable:'badge-orange', Technicien:'badge-blue', Operateur:'badge-green', Lecteur:'badge-gray' };

export default function UtilisateursPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nom:'', prenom:'', email:'', mot_de_passe:'', role_id:'' });

  const load = () => {
    Promise.all([utilisateursAPI.lister(), utilisateursAPI.roles()])
      .then(([u,r])=>{ setUsers(u.data); setRoles(r.data); })
      .catch(console.error).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[]);

  const creer = async e => {
    e.preventDefault();
    if (!form.nom||!form.prenom||!form.email||!form.mot_de_passe||!form.role_id) return toast.error('Tous les champs sont requis');
    try {
      await utilisateursAPI.creer(form);
      toast.success('Utilisateur créé !');
      setModal(false);
      setForm({ nom:'',prenom:'',email:'',mot_de_passe:'',role_id:'' });
      load();
    } catch(err) { toast.error(err.response?.data?.error||'Erreur'); }
  };

  const toggle = async id => {
    try { await utilisateursAPI.toggleActif(id); load(); }
    catch { toast.error('Erreur'); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {modal && (
        <div className="modal-overlay"><div className="modal max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold">Nouvel utilisateur</h3>
            <button onClick={()=>setModal(false)}><X size={18} className="text-gray-500"/></button>
          </div>
          <form onSubmit={creer} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[['prenom','Prénom'],['nom','Nom']].map(([k,l])=>(
                <div key={k}><label className="label-req">{l}</label>
                  <input value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} className="input"/></div>
              ))}
            </div>
            <div><label className="label-req">Email</label>
              <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className="input"/></div>
            <div><label className="label-req">Mot de passe</label>
              <input type="password" value={form.mot_de_passe} onChange={e=>setForm(p=>({...p,mot_de_passe:e.target.value}))} className="input" placeholder="min. 8 caractères"/></div>
            <div><label className="label-req">Rôle</label>
              <select value={form.role_id} onChange={e=>setForm(p=>({...p,role_id:e.target.value}))} className="select">
                <option value="">— Sélectionner —</option>
                {roles.map(r=><option key={r.id} value={r.id}>{r.nom}</option>)}
              </select></div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={()=>setModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button type="submit" className="btn-primary flex-1">Créer</button>
            </div>
          </form>
        </div></div>
      )}

      {isAdmin() && (
        <div className="flex justify-end">
          <button onClick={()=>setModal(true)} className="btn-primary flex items-center gap-2"><UserPlus size={16}/>Nouvel utilisateur</button>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="th">Utilisateur</th><th className="th">Email</th>
              <th className="th">Rôle</th><th className="th">Statut</th>
              <th className="th">Dernière connexion</th>
              {isAdmin()&&<th className="th text-center">Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
            : users.map(u=>(
              <tr key={u.id} className={`tr ${!u.actif?'opacity-50':''}`}>
                <td className="td">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                      {u.prenom?.[0]}{u.nom?.[0]}
                    </div>
                    <p className="font-medium text-sm text-gray-800">{u.prenom} {u.nom}</p>
                  </div>
                </td>
                <td className="td text-sm text-gray-500">{u.email}</td>
                <td className="td"><span className={RC[u.role_nom]||'badge-gray'}>{u.role_nom}</span></td>
                <td className="td"><span className={u.actif?'badge-green':'badge-gray'}>{u.actif?'Actif':'Inactif'}</span></td>
                <td className="td text-xs text-gray-400">{u.derniere_connexion ? new Date(u.derniere_connexion).toLocaleDateString('fr-FR') : '—'}</td>
                {isAdmin()&&(
                  <td className="td text-center">
                    <button onClick={()=>toggle(u.id)}
                      className={`p-1.5 rounded-lg transition-colors ${u.actif?'bg-red-50 text-red-500 hover:bg-red-100':'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {u.actif?<UserX size={16}/>:<UserCheck size={16}/>}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
