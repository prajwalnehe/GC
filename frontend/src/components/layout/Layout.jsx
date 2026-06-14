import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const handleSidebarToggle = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen((v) => !v);
    } else {
      setSidebarOpen((v) => !v);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <Sidebar
        desktopOpen={sidebarOpen}
        mobileOpen={mobileOpen}
        onToggle={handleSidebarToggle}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Navbar
        onMenuToggle={() => setMobileOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />
      <main className={`pt-16 transition-all duration-300 min-w-0 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} ml-0`}>
        <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
