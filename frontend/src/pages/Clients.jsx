import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, Building2 } from 'lucide-react';
import { clientsAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { PageHeader, SearchBar, Pagination } from '../components/common/PageElements';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ clientName: '', companyName: '', projectDetails: '', contactDetails: { email: '', phone: '', city: '' } });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await clientsAPI.getAll({ search, page, limit: 10 });
      setClients(data.clients);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to fetch clients'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [search, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await clientsAPI.update(editing._id, form); toast.success('Updated'); }
      else { await clientsAPI.create(form); toast.success('Created'); }
      setShowModal(false);
      fetchData();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await clientsAPI.delete(id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <PageHeader title="Clients" subtitle={`${total} clients`} action={
        <button onClick={() => { setEditing(null); setForm({ clientName: '', companyName: '', projectDetails: '', contactDetails: { email: '', phone: '', city: '' } }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      } />

      <div className="card mb-6"><SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search clients..." /></div>

      <div className="card overflow-x-auto">
        {loading ? <TableSkeleton cols={5} /> : clients.length === 0 ? (
          <EmptyState icon={Building2} title="No clients" description="Clients are auto-created when leads are won" />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 dark:border-secondary-700">
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Client</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Company</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Email</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Created</th>
                  <th className="text-right py-3 px-2 font-medium text-secondary-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c._id} className="border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30">
                    <td className="py-3 px-2 font-medium">{c.clientName}</td>
                    <td className="py-3 px-2">{c.companyName}</td>
                    <td className="py-3 px-2 text-secondary-500">{c.contactDetails?.email || '-'}</td>
                    <td className="py-3 px-2 text-secondary-500">{formatDate(c.createdAt)}</td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(c); setForm(c); setShowModal(true); }} className="p-1.5 rounded hover:bg-secondary-100"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Client' : 'Add Client'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Client Name</label><input type="text" required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Company</label><input type="text" required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Email</label><input type="email" value={form.contactDetails?.email || ''} onChange={(e) => setForm({ ...form, contactDetails: { ...form.contactDetails, email: e.target.value } })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Phone</label><input type="tel" value={form.contactDetails?.phone || ''} onChange={(e) => setForm({ ...form, contactDetails: { ...form.contactDetails, phone: e.target.value } })} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Project Details</label><textarea rows={3} value={form.projectDetails} onChange={(e) => setForm({ ...form, projectDetails: e.target.value })} className="input-field resize-none" /></div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Clients;
