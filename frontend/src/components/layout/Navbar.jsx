import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationsAPI } from '../../services/api';

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await notificationsAPI.getAll();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    await notificationsAPI.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <header className={`fixed top-0 right-0 z-30 h-16 bg-white dark:bg-secondary-800 border-b border-secondary-100 dark:border-secondary-700 transition-all duration-300 ${sidebarOpen ? 'left-64' : 'left-20'} max-lg:left-0`}>
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700">
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:block">
          <p className="text-sm text-secondary-500">
            Welcome back, <span className="font-semibold text-secondary-800 dark:text-secondary-100">{user?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-secondary-600" />}
          </button>

          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="relative p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-secondary-100 dark:border-secondary-700 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-secondary-500 text-center">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n._id}
                        onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                        className={`px-4 py-3 border-b border-secondary-50 dark:border-secondary-700 cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-700 ${!n.isRead ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                      >
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-secondary-500 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.name}</span>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-secondary-100 dark:border-secondary-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-secondary-100 dark:border-secondary-700">
                  <p className="font-medium text-sm">{user?.name}</p>
                  <p className="text-xs text-secondary-500">{user?.role}</p>
                </div>
                <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-secondary-50 dark:hover:bg-secondary-700" onClick={() => setShowProfile(false)}>
                  Settings
                </Link>
                <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
