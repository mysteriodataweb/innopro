import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alertesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, AlertTriangle, Info, Zap, Wrench, RefreshCw, FileWarning } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const cfg = {
  MAINTENANCE_PREVENTIVE: {
    icon: Wrench,
    label: 'Planning / préventif',
    cls: 'badge-blue',
    bg: 'bg-blue-50 border-blue-100',
  },
  FORMULAIRE_EN_RETARD: {
    icon: FileWarning,
    label: 'Formulaire non rempli (24 h)',
    cls: 'badge-orange',
    bg: 'bg-orange-50 border-orange-100',
  },
  PANNE_CRITIQUE: {
    icon: Zap,
    label: 'Panne critique',
    cls: 'badge-red',
    bg: 'bg-red-50 border-red-100',
  },
  STOCK_BAS: {
    icon: Info,
    label: 'Stock bas',
    cls: 'badge-yellow',
    bg: 'bg-yellow-50 border-yellow-100',
  },
};

export default function AlertesPage() {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filtre, setFiltre] = useState('NON_LUE');

  const load = (sync = true) => {
    setLoading(true);
    alertesAPI
      .lister({ statut: filtre || undefined, sync: sync ? 'true' : 'false' })
      .then(r => setAlertes(r.data))
      .catch(() => toast.error('Erreur chargement alertes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(true);
  }, [filtre]);

  const refresh = async () => {
    setSyncing(true);
    try {
      await alertesAPI.synchroniser();
      load(false);
      toast.success('Alertes mises à jour');
    } catch {
      toast.error('Erreur synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const marquer = async (id, statut) => {
    await alertesAPI.marquer(id, { statut });
    load(false);
    toast.success('Alerte mise à jour');
  };

  const toutesLues = async () => {
    await alertesAPI.toutesLues();
    load(false);
    toast.success('Toutes les alertes marquées comme lues');
  };

  const counts = {
    critique: alertes.filter(a => a.type_alerte === 'PANNE_CRITIQUE').length,
    retard: alertes.filter(a => a.type_alerte === 'FORMULAIRE_EN_RETARD').length,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Alertes maintenance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rappels formulaires (&lt; 24 h), pannes critiques, disponibilité, planning incomplet et stock.
        </p>
      </header>

      <div className="card flex flex-wrap items-center gap-3">
        <select value={filtre} onChange={e => setFiltre(e.target.value)} className="select w-auto">
          <option value="NON_LUE">Non lues</option>
          <option value="LUE">Lues</option>
          <option value="TRAITEE">Traitées</option>
          <option value="">Toutes</option>
        </select>
        <button
          type="button"
          onClick={refresh}
          disabled={syncing}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          Actualiser
        </button>
        {filtre === 'NON_LUE' && alertes.length > 0 && (
          <button onClick={toutesLues} className="btn-secondary ml-auto flex items-center gap-2 text-sm">
            <CheckCheck size={16} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {filtre === 'NON_LUE' && (counts.critique > 0 || counts.retard > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {counts.critique > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
              <Zap className="mb-2 text-red-600" size={22} />
              <strong>{counts.critique}</strong> panne(s) critique(s) signalée(s)
            </div>
          )}
          {counts.retard > 0 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm">
              <AlertTriangle className="mb-2 text-orange-600" size={22} />
              <strong>{counts.retard}</strong> formulaire(s) non rempli(s) sous 24 h
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : alertes.length === 0 ? (
        <div className="card py-16 text-center">
          <Bell size={40} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aucune alerte pour ce filtre.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertes.map(a => {
            const c = cfg[a.type_alerte] || {
              icon: Bell,
              label: a.type_alerte,
              cls: 'badge-gray',
              bg: 'bg-gray-50 border-gray-100',
            };
            const Icon = c.icon;
            return (
              <div key={a.id} className={`card flex items-start gap-4 border ${c.bg}`}>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{c.label}</p>
                    <span className={c.cls}>{a.statut}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                  {(a.equipement_nom || a.formulaire_titre) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {a.equipement_nom && <>Équipement : {a.equipement_nom}</>}
                      {a.formulaire_titre && <> · {a.formulaire_titre}</>}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.date_creation), { addSuffix: true, locale: fr })}
                    </p>
                    <div className="flex gap-2">
                      {a.type_alerte === 'FORMULAIRE_EN_RETARD' && (
                        <Link to="/formulaires" className="text-xs text-primary hover:underline">
                          Remplir
                        </Link>
                      )}
                      {a.statut === 'NON_LUE' && (
                        <button
                          type="button"
                          onClick={() => marquer(a.id, 'LUE')}
                          className="text-xs text-primary hover:underline"
                        >
                          Marquer lu
                        </button>
                      )}
                      {a.statut === 'LUE' && (
                        <button
                          type="button"
                          onClick={() => marquer(a.id, 'TRAITEE')}
                          className="text-xs text-green-600 hover:underline"
                        >
                          Traité
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
