import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { useState, useEffect, useCallback } from 'react';
import { alertesAPI } from '../../services/api';

const titles = {
  '/':               'Tableau de bord',
  '/formulaires':    'Formulaires',
  '/soumissions':    'Soumissions',
  '/historique':     'Historique',
  '/equipements':    'Équipements',
  '/planning':       'Planning',
  '/lignes':         'Lignes de production',
  '/stock':          'Stock pièces',
  '/matieres':       'Matières premières',
  '/alertes':        'Alertes',
  '/utilisateurs':   'Utilisateurs',
  '/generateur-excel':'Générateur Excel',
};

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, moduleScope, selectModule } = useAuth();
  const [nbAlertes, setNbAlertes] = useState(0);

  const title = Object.entries(titles)
    .find(([k]) => pathname === k || pathname.startsWith(k + '/'))
    ?.[1] || 'InnoFaso';

  // Utilise countNonLues() dédié — plus léger que lister()
  const fetchCount = useCallback(() => {
    alertesAPI.countNonLues()
      .then(r => setNbAlertes(r.data?.count || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCount();
    // Rafraîchir toutes les 60 secondes automatiquement
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [fetchCount, pathname]); // recharger aussi à chaque changement de page

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h2 className="font-display text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Bouton changer de module (admin uniquement) */}
        {isAdmin() && moduleScope && (
          <button
            type="button"
            onClick={() => { selectModule(''); navigate('/modules'); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
              ${moduleScope === 'MAINTENANCE'
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-secondary/10 text-secondary hover:bg-secondary/20'}`}
          >
            {moduleScope === 'MAINTENANCE' ? 'Maintenance' : 'Production'} • Changer
          </button>
        )}

        {/* Cloche alertes avec compteur rouge */}
        <Link to="/alertes" className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
          <Bell size={20} className={nbAlertes > 0 ? 'text-red-500' : 'text-gray-500'}/>
          {nbAlertes > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
              {nbAlertes > 99 ? '99+' : nbAlertes > 9 ? '9+' : nbAlertes}
            </span>
          )}
        </Link>

        {/* Avatar utilisateur */}
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm select-none">
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
      </div>
    </header>
  );
}