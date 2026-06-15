import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, UserCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { ROLES } from '../utils/helpers';
import { NAV_TABS, ALL_TAB_IDS } from '../utils/navTabs';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { PageHeader } from '../components/common/PageElements';

const defaultForm = () => ({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Sales Executive',
  phone: '',
  isActive: true,
  allowedTabs: ['dashboard'],
});

const Users = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const assignableTabs = NAV_TABS.filter((t) => t.id !== 'users');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.getAll();
      setUsers(data);
    } catch { toast.error('Failed to fetch users'); }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const toggleTab = (tabId) => {
    setForm((prev) => {
      const has = prev.allowedTabs.includes(tabId);
      const allowedTabs = has
        ? prev.allowedTabs.filter((id) => id !== tabId)
        : [...prev.allowedTabs, tabId];
      return { ...prev, allowedTabs };
    });
  };

  const handleRoleChange = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
      allowedTabs: role === 'Admin' ? [...ALL_TAB_IDS] : prev.allowedTabs.filter((id) => id !== 'users'),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.allowedTabs.length && form.role !== 'Admin') {
      toast.error('Select at least one tab');
      return;
    }
    if (editing && form.password && form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    if (!editing) {
      if (!form.password || form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        allowedTabs: form.role === 'Admin' ? ALL_TAB_IDS : form.allowedTabs,
      };
      delete payload.confirmPassword;
      if (editing) {
        if (!payload.password) delete payload.password;
        await usersAPI.update(editing._id, payload);
        toast.success('User updated');
      } else {
        await usersAPI.create(payload);
        toast.success('User created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await usersAPI.delete(id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm());
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      confirmPassword: '',
      role: u.role,
      phone: u.phone || '',
      isActive: u.isActive,
      allowedTabs: u.allowedTabs?.length ? [...u.allowedTabs] : [],
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
  };

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage team members, roles & tab access" action={
        <button onClick={openCreate} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add User
        </button>
      } />

      <div className="card overflow-visible">
        {loading ? <TableSkeleton cols={6} /> : users.length === 0 ? (
          <EmptyState icon={UserCircle} title="No users" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-100 dark:border-secondary-700">
                <th className="text-left py-2.5 px-2 font-medium text-secondary-500">Name</th>
                <th className="text-left py-2.5 px-2 font-medium text-secondary-500 hidden md:table-cell">Email</th>
                <th className="text-left py-2.5 px-2 font-medium text-secondary-500">Role</th>
                <th className="text-left py-2.5 px-2 font-medium text-secondary-500 hidden lg:table-cell">Tabs</th>
                <th className="text-left py-2.5 px-2 font-medium text-secondary-500 hidden sm:table-cell">Status</th>
                <th className="text-right py-2.5 px-2 font-medium text-secondary-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30">
                  <td className="py-2.5 px-2 font-medium min-w-0">
                    <span className="block truncate">{u.name}</span>
                    <span className="block truncate text-xs text-secondary-500 md:hidden">{u.email}</span>
                  </td>
                  <td className="py-2.5 px-2 text-secondary-500 hidden md:table-cell min-w-0 truncate">{u.email}</td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <span className={`badge ${u.role === 'Admin' ? 'bg-primary-100 text-primary-800' : 'bg-secondary-100 text-secondary-700'}`}>{u.role}</span>
                  </td>
                  <td className="py-2.5 px-2 text-secondary-500 hidden lg:table-cell whitespace-nowrap text-xs">
                    {u.role === 'Admin' ? 'All tabs' : `${u.allowedTabs?.length || 0} tabs`}
                  </td>
                  <td className="py-2.5 px-2 hidden sm:table-cell whitespace-nowrap">
                    <span className={`badge ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-secondary-100"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(u._id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit User' : 'Add User'} size="lg" scrollable={false}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                {editing ? 'New Password (optional)' : 'Password *'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!editing}
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-secondary-400" /> : <Eye className="w-4 h-4 text-secondary-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {editing ? 'Confirm Password' : 'Confirm Password *'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required={!editing}
                  minLength={6}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input-field pl-10 pr-10"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 text-secondary-400" /> : <Eye className="w-4 h-4 text-secondary-400" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select value={form.role} onChange={(e) => handleRoleChange(e.target.value)} className="input-field">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {editing && (
              <label className="flex items-center gap-2 text-sm pb-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Allowed Tabs</label>
            {form.role === 'Admin' ? (
              <p className="text-sm text-secondary-500 p-2.5 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg">Admin users can access all tabs automatically.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                {assignableTabs.map((tab) => (
                  <label key={tab.id} className={`flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                    form.allowedTabs.includes(tab.id)
                      ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                      : 'border-secondary-200 dark:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-700/50'
                  }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.allowedTabs.includes(tab.id)}
                      onChange={() => toggleTab(tab.id)}
                      className="rounded text-primary shrink-0"
                    />
                    <span className="text-xs sm:text-sm truncate">{tab.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
