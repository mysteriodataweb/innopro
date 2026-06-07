import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../store/auth';
import DashboardMaintenancePage from './DashboardMaintenancePage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ClipboardList, CheckCircle, AlertTriangle, Clock, TrendingUp, ChevronRight, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const statutBadge = {
  VALIDE:    'badge-green', SOUMIS: 'badge-blue',
  BROUILLON: 'badge-gray',
};
const moduleBadge = { MAINTENANCE: 'badge-blue', PRODUCTION: 'badge-green' };

function StatCard({ icon: Icon, label, value, color = 'primary' }) {
  const bg = { primary:'bg-primary/10 text-primary', accent:'bg-accent/10 text-accent-dark',
                red:'bg-red-100 text-red-600', blue:'bg-blue-100 text-blue-600' };
  return (
    <div className="card flex items-start gap-4 animate-slide-up">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg[color]}`}>
        <Icon size={22}/>
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-display text-3xl font-bold text-gray-900 mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, moduleScope, isAdmin } = useAuth();

  if (moduleScope === 'MAINTENANCE' || (!isAdmin() && user?.role === 'Technicien')) {
    return <DashboardMaintenancePage />;
  }

  return <DashboardProduction user={user} />;
}

function DashboardProduction({ user }) {
  const [stats, setStats] = useState(null);
  const [activite, setActivite] = useState([]);
  const [retard, setRetard] = useState([]);
  const [kpi, setKpi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.stats(), dashboardAPI.activite(),
      dashboardAPI.retard(), dashboardAPI.kpi()
    ]).then(([s,a,r,k]) => {
      setStats(s.data); setActivite(a.data); setRetard(r.data); setKpi(k.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalSoum = stats ? Object.values(stats.soumissions_30j).reduce((a,b)=>a+b,0) : 0;
  const nbNonLues = stats?.alertes?.NON_LUE || 0;

  // Agréger kpi par mois pour le graphique
  const chartData = (() => {
    const map = {};
    kpi.forEach(r => {
      const m = new Date(r.mois).toLocaleDateString('fr-FR',{month:'short'});
      if (!map[m]) map[m] = { name:m, SOUMIS:0, VALIDE:0 };
      map[m][r.statut] = (map[m][r.statut]||0) + +r.total;
    });
    return Object.values(map).slice(0,6).reverse();
  })();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Bonjour, {user?.prenom} 👋</h1>
        <p className="text-gray-500 mt-1 text-sm">Aperçu de l'activité du système InnoFaso</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList}  label="Formulaires actifs"    value={stats?.formulaires_actifs}    color="primary"/>
        <StatCard icon={TrendingUp}     label="Soumissions (30 jours)" value={totalSoum}                   color="blue"/>
        <StatCard icon={AlertTriangle}  label="Alertes non lues"      value={nbNonLues}                    color={nbNonLues>0?'red':'primary'}/>
        <StatCard icon={Clock}          label="Formulaires en retard" value={stats?.formulaires_en_retard} color="accent"/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Graphique */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-semibold text-gray-900">Activité 6 derniers mois</h3>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" tick={{fontSize:12}}/>
                <YAxis tick={{fontSize:12}}/>
                <Tooltip contentStyle={{borderRadius:12,border:'none',boxShadow:'0 4px 20px rgba(0,0,0,.1)'}}/>
                <Bar dataKey="SOUMIS"  fill="#B7E4C7" radius={[6,6,0,0]} name="Soumis"/>
                <Bar dataKey="VALIDE"  fill="#1B4332" radius={[6,6,0,0]} name="Validés"/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-300 text-sm">Aucune donnée</div>
          )}
        </div>

        {/* Retards */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-gray-900">En retard</h3>
            <Link to="/formulaires" className="text-primary text-xs hover:underline flex items-center gap-1">
              Voir tout <ChevronRight size={14}/>
            </Link>
          </div>
          <div className="space-y-2">
            {retard.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle size={32} className="mx-auto mb-2 text-green-400"/>
                <p className="text-sm">Tout est à jour !</p>
              </div>
            ) : retard.slice(0,7).map(f => (
              <div key={f.id} className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"/>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{f.titre}</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {f.jours_retard ? `${f.jours_retard}j de retard` : 'Jamais soumis'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-gray-900">Activité récente</h3>
          <Link to="/soumissions" className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
            Toutes <ArrowRight size={16}/>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="th">Formulaire</th>
                <th className="th">Module</th>
                <th className="th">Auteur</th>
                <th className="th">Statut</th>
                <th className="th">Date</th>
              </tr>
            </thead>
            <tbody>
              {activite.length === 0
                ? <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">Aucune activité récente</td></tr>
                : activite.map(a => (
                  <tr key={a.id} className="tr">
                    <td className="td">
                      <Link to={`/soumissions/${a.id}`} className="font-medium text-primary hover:underline text-sm">
                        {a.form_code}
                      </Link>
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{a.form_titre}</p>
                    </td>
                    <td className="td"><span className={moduleBadge[a.module]||'badge-gray'}>{a.module}</span></td>
                    <td className="td text-sm">{a.auteur}</td>
                    <td className="td"><span className={statutBadge[a.statut]||'badge-gray'}>{a.statut}</span></td>
                    <td className="td text-xs text-gray-400">
                      {formatDistanceToNow(new Date(a.date_soumission),{addSuffix:true,locale:fr})}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
