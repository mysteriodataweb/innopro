import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('if_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [moduleScope, setModuleScope] = useState(() => {
    try { return localStorage.getItem('if_module') || ''; } catch { return ''; }
  });

  useEffect(() => {
    const token = localStorage.getItem('if_token');
    if (token) {
      authAPI.me().then(r => setUser(r.data)).catch(() => {
        localStorage.removeItem('if_token'); localStorage.removeItem('if_user'); setUser(null);
      }).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, mot_de_passe) => {
    const { data } = await authAPI.login({ email, mot_de_passe });
    localStorage.setItem('if_token', data.token);
    localStorage.setItem('if_user', JSON.stringify(data.utilisateur));
    setUser(data.utilisateur);
    if (data.utilisateur?.role !== 'Admin') {
      localStorage.removeItem('if_module');
      setModuleScope('');
    }
    return data.utilisateur;
  };

  const logout = () => {
    localStorage.removeItem('if_token'); localStorage.removeItem('if_user'); setUser(null);
  };

  const selectModule = (module) => {
    if (!module) {
      localStorage.removeItem('if_module');
      setModuleScope('');
      return;
    }
    localStorage.setItem('if_module', module);
    setModuleScope(module);
  };

  useEffect(() => {
    if (user && user.role !== 'Admin') {
      localStorage.removeItem('if_module');
      setModuleScope('');
    }
  }, [user]);

  const hasRole = (...roles) => roles.includes(user?.role);
  const isAdmin = () => hasRole('Admin');
  const peutValider = () => hasRole('Admin','Responsable');
  const peutGerer = () => hasRole('Admin','Responsable');

  return (
    <Ctx.Provider value={{
      user, loading, login, logout,
      hasRole, isAdmin, peutValider, peutGerer,
      moduleScope, selectModule,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider');
  return ctx;
};
