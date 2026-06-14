import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <Sidebar isOpen={sidebarOpen || mobileOpen} onToggle={() => {
        if (window.innerWidth < 1024) {
          setMobileOpen(!mobileOpen);
        } else {
          setSidebarOpen(!sidebarOpen);
        }
      }} />
      <Navbar
        onMenuToggle={() => setMobileOpen(!mobileOpen)}
        sidebarOpen={sidebarOpen}
      />
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} ml-0`}>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
