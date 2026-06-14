export const NAV_TABS = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard' },
  { id: 'leads', path: '/leads', label: 'Leads' },
  { id: 'followup-leads', path: '/followup-leads', label: 'Followup Leads' },
  { id: 'proposals', path: '/proposals', label: 'Proposals' },
  { id: 'clients', path: '/clients', label: 'Clients' },
  { id: 'projects', path: '/projects', label: 'Projects' },
  { id: 'payments', path: '/payments', label: 'Payments' },
  { id: 'users', path: '/users', label: 'Users', adminOnly: true },
  { id: 'settings', path: '/settings', label: 'Settings' },
];

export const ALL_TAB_IDS = NAV_TABS.map((t) => t.id);

export const DEFAULT_TABS = ['dashboard', 'leads', 'followup-leads', 'settings'];

export const getTabIdFromPath = (pathname) => {
  if (pathname === '/dashboard') return 'dashboard';
  if (pathname.startsWith('/followup-leads')) return 'followup-leads';
  if (pathname.startsWith('/leads')) return 'leads';
  const match = NAV_TABS.find((t) => pathname === t.path || pathname.startsWith(`${t.path}/`));
  return match?.id || null;
};
