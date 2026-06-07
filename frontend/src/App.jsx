import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import AdminModuleHomePage from './pages/AdminModuleHomePage';
import DashboardPage from './pages/DashboardPage';
import FormulaireListPage from './pages/FormulaireListPage';
import FormulaireBuilderPage from './pages/FormulaireBuilderPage';
import FormulaireRemplirPage from './pages/FormulaireRemplirPage';
import ExcelFormGeneratorPage from './pages/ExcelFormGeneratorPage';
import SoumissionsPage from './pages/SoumissionsPage';
import SoumissionDetailPage from './pages/SoumissionDetailPage';
import EquipementsPage from './pages/EquipementsPage';
import AlertesPage from './pages/AlertesPage';
import PlanningPage from './pages/PlanningPage';
import StockPage from './pages/StockPage';
import UtilisateursPage from './pages/UtilisateursPage';

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-gray-500 text-sm">Chargement…</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace/>;
}

function ModuleScopeGate({ children }) {
  const { isAdmin, moduleScope } = useAuth();
  if (isAdmin() && !moduleScope) return <Navigate to="/modules" replace/>;
  return children;
}

function ModuleGuard({ allowed, children }) {
  const { isAdmin, moduleScope } = useAuth();
  if (!isAdmin()) return children;
  if (!moduleScope) return <Navigate to="/modules" replace/>;
  if (allowed && !allowed.includes(moduleScope)) return <Navigate to="/" replace/>;
  return children;
}

export default function App() {
  const { user, isAdmin, moduleScope } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace/> : <LoginPage/>}/>
      <Route path="/modules" element={<Guard><AdminModuleHomePage/></Guard>}/>
      <Route path="/" element={<Guard><ModuleScopeGate><Layout/></ModuleScopeGate></Guard>}>
        <Route index element={isAdmin() && !moduleScope ? <Navigate to="/modules" replace/> : <DashboardPage/>}/>
        <Route path="formulaires" element={<ModuleGuard allowed={['MAINTENANCE','PRODUCTION']}><FormulaireListPage/></ModuleGuard>}/>
        <Route path="formulaires/:id/remplir" element={<ModuleGuard allowed={['MAINTENANCE','PRODUCTION']}><FormulaireRemplirPage/></ModuleGuard>}/>
        <Route path="generateur-excel" element={<ExcelFormGeneratorPage/>}/>
        <Route path="formulaires/:id/builder" element={<ModuleGuard allowed={['MAINTENANCE','PRODUCTION']}><FormulaireBuilderPage/></ModuleGuard>}/>
        <Route path="soumissions/:id" element={<ModuleGuard allowed={['MAINTENANCE','PRODUCTION']}><SoumissionDetailPage/></ModuleGuard>}/>
        <Route path="soumissions" element={<ModuleGuard allowed={['MAINTENANCE','PRODUCTION']}><SoumissionsPage/></ModuleGuard>}/>
        <Route path="historique" element={<ModuleGuard allowed={['MAINTENANCE','PRODUCTION']}><SoumissionsPage/></ModuleGuard>}/>
        <Route path="equipements" element={<ModuleGuard allowed={['MAINTENANCE']}><EquipementsPage/></ModuleGuard>}/>
        <Route path="alertes" element={<ModuleGuard allowed={['MAINTENANCE']}><AlertesPage/></ModuleGuard>}/>
        <Route path="planning" element={<ModuleGuard allowed={['MAINTENANCE']}><PlanningPage/></ModuleGuard>}/>
        <Route path="stock" element={<ModuleGuard allowed={['MAINTENANCE']}><StockPage/></ModuleGuard>}/>
        <Route path="utilisateurs" element={<UtilisateursPage/>}/>
      </Route>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}
