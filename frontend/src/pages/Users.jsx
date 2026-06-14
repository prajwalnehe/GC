import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { ROLES } from '../utils/helpers';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { PageHeader } from '../components/common/PageElements';

const Users = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Sales Executive', phone: '', isActive: true });
  const [saving, setSaving] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password;
        await usersAPI.update(editing._id, updateData);
        toast.success('User updated');
      } else {
        await usersAPI.create(form);
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

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage team members and roles" action={
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'Sales Executive', phone: '', isActive: true }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add User
        </button>
      } />

      <div className="card overflow-x-auto">
        {loading ? <TableSkeleton cols={5} /> : users.length === 0 ? (
          <EmptyState icon={UserCircle} title="No users" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-100 dark:border-secondary-700">
                <th className="text-left py-3 px-2 font-medium text-secondary-500">Name</th>
                <th className="text-left py-3 px-2 font-medium text-secondary-500">Email</th>
                <th className="text-left py-3 px-2 font-medium text-secondary-500">Role</th>
                <th className="text-left py-3 px-2 font-medium text-secondary-500">Status</th>
                <th className="text-right py-3 px-2 font-medium text-secondary-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30">
                  <td className="py-3 px-2 font-medium">{u.name}</td>
                  <td className="py-3 px-2 text-secondary-500">{u.email}</td>
                  <td className="py-3 px-2"><span className={`badge ${u.role === 'Admin' ? 'bg-primary-100 text-primary-800' : 'bg-secondary-100 text-secondary-700'}`}>{u.role}</span></td>
                  <td className="py-3 px-2"><span className={`badge ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="py-3 px-2">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone, isActive: u.isActive }); setShowModal(true); }} className="p-1.5 rounded hover:bg-secondary-100"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(u._id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Name</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1.5">{editing ? 'New Password (leave blank to keep)' : 'Password'}</label><input type="password" required={!editing} minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>
          )}
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
