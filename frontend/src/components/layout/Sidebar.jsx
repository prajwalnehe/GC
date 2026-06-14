import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCircle, FolderKanban, CreditCard,
  FileText, Calendar, Building2, Settings, ChevronLeft, ChevronRight, Code2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leads', label: 'Leads', icon: Users },
  { path: '/follow-ups', label: 'Follow-ups', icon: Calendar },
  { path: '/proposals', label: 'Proposals', icon: FileText },
  { path: '/clients', label: 'Clients', icon: Building2 },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/users', label: 'Users', icon: UserCircle, adminOnly: true },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-secondary-800 border-r border-secondary-100 dark:border-secondary-700 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-20'
        } lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-secondary-100 dark:border-secondary-700">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <div>
              <h1 className="font-bold text-secondary-800 dark:text-white text-lg leading-tight">Growwcode</h1>
              <p className="text-xs text-secondary-400">Lead CRM</p>
            </div>
          )}
        </div>

        <nav className="p-3 space-y-1 mt-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${!isOpen ? 'justify-center px-2' : ''}`}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600 rounded-full items-center justify-center shadow-sm hover:bg-secondary-50 dark:hover:bg-secondary-600"
        >
          {isOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
