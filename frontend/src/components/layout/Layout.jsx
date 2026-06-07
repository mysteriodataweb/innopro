import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
export default function Layout() {
  const { pathname } = useLocation();
  const compactSidebar = pathname.startsWith('/generateur-excel');
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar compact={compactSidebar}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header/>
        <main className={`flex-1 overflow-y-auto animate-fade-in ${compactSidebar ? 'p-4' : 'p-6'}`}>
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
