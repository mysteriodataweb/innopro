import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { useState, useEffect } from 'react';
import { alertesAPI } from '../../services/api';

const titles = {
  '/':'/Tableau de bord', '/formulaires':'Formulaires', '/soumissions':'Soumissions',
  '/historique':'Historique',
  '/equipements':'Équipements', '/planning':'Planning', '/stock':'Stock pièces',
  '/alertes':'Alertes', '/utilisateurs':'Utilisateurs', '/generateur-excel':'Generateur Excel',
};

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, moduleScope, selectModule } = useAuth();
  const [nbAlertes, setNbAlertes] = useState(0);
  const title = Object.entries(titles).find(([k]) => pathname === k || pathname.startsWith(k+'/'))?.[1]?.replace('/','') || 'InnoFaso';

  useEffect(() => {
    alertesAPI.lister({ statut: 'NON_LUE' })
      .then(r => setNbAlertes(r.data.length)).catch(() => {});
  }, [pathname]);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h2 className="font-display text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400">{new Date().toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>
      <div className="flex items-center gap-3">
        {isAdmin() && moduleScope && (
          <button
            type="button"
            onClick={() => { selectModule(''); navigate('/modules'); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${moduleScope === 'MAINTENANCE' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}
          >
            {moduleScope === 'MAINTENANCE' ? 'Maintenance' : 'Production'} • Changer
          </button>
        )}
        <Link to="/alertes" className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
          <Bell size={20} className="text-gray-500"/>
          {nbAlertes > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              {nbAlertes > 9 ? '9+' : nbAlertes}
            </span>
          )}
        </Link>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
      </div>
    </header>
  );
}
