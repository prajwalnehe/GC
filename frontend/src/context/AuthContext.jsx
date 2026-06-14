import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { ALL_TAB_IDS, NAV_TABS } from '../utils/navTabs';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('growwcode_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (user?.token) {
        try {
          const { data } = await authAPI.getMe();
          const updated = { ...user, ...data };
          localStorage.setItem('growwcode_user', JSON.stringify(updated));
          setUser(updated);
        } catch {
          localStorage.removeItem('growwcode_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('growwcode_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('growwcode_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('growwcode_user');
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem('growwcode_user', JSON.stringify(updated));
    setUser(updated);
  };

  const isAdmin = user?.role === 'Admin';
  const isLeadManager = user?.role === 'Lead Manager';
  const canViewAllLeads = isAdmin || isLeadManager;

  const getAllowedTabs = () => {
    if (isAdmin) return ALL_TAB_IDS;
    return user?.allowedTabs || [];
  };

  const hasTabAccess = (tabId) => {
    if (isAdmin) return true;
    if (tabId === 'users') return false;
    return (user?.allowedTabs || []).includes(tabId);
  };

  const getHomePath = () => {
    if (isAdmin) return '/dashboard';
    const allowed = user?.allowedTabs || [];
    const tab = NAV_TABS.find((t) => allowed.includes(t.id) && !t.adminOnly);
    return tab?.path || '/dashboard';
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateUser, isAdmin, isLeadManager, canViewAllLeads, hasTabAccess, getAllowedTabs, getHomePath,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
};
