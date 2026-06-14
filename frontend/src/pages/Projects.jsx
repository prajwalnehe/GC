import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, FolderKanban } from 'lucide-react';
import { projectsAPI, clientsAPI, usersAPI } from '../services/api';
import { PROJECT_STATUSES, formatCurrency, formatDate } from '../utils/helpers';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { PageHeader, Pagination, TableWrapper } from '../components/common/PageElements';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ projectName: '', client: '', clientName: '', description: '', startDate: '', endDate: '', budget: '', status: 'Planning', assignedTeam: [] });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await projectsAPI.getAll({ page, limit: 10 });
      setProjects(data.projects);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to fetch projects'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => {
    clientsAPI.getAll({ limit: 100 }).then(({ data }) => setClients(data.clients)).catch(() => {});
    usersAPI.getAll().then(({ data }) => setUsers(data)).catch(() => {});
  }, []);

  const handleClientChange = (clientId) => {
    const client = clients.find((c) => c._id === clientId);
    setForm({ ...form, client: clientId, clientName: client?.clientName || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await projectsAPI.update(editing._id, form); toast.success('Updated'); }
      else { await projectsAPI.create(form); toast.success('Created'); }
      setShowModal(false);
      fetchData();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await projectsAPI.delete(id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <PageHeader title="Projects" subtitle="Manage client projects" action={
        <button onClick={() => { setEditing(null); setForm({ projectName: '', client: '', clientName: '', description: '', startDate: '', endDate: '', budget: '', status: 'Planning', assignedTeam: [] }); setShowModal(true); }} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      } />

      <div className="card">
        {loading ? <TableSkeleton cols={6} /> : projects.length === 0 ? (
          <EmptyState icon={FolderKanban} title="No projects" description="Create your first project" />
        ) : (
          <>
            <TableWrapper>
            <table className="data-table">
              <thead>
                <tr className="border-b border-secondary-100 dark:border-secondary-700">
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Project</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 hidden md:table-cell">Client</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 hidden sm:table-cell">Budget</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 hidden lg:table-cell">Timeline</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-secondary-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p._id} className="border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30">
                    <td className="py-3 px-2 font-medium max-w-[140px] truncate">{p.projectName}</td>
                    <td className="py-3 px-2 hidden md:table-cell max-w-[120px] truncate">{p.clientName}</td>
                    <td className="py-3 px-2 hidden sm:table-cell whitespace-nowrap">{formatCurrency(p.budget)}</td>
                    <td className="py-3 px-2 text-secondary-500 text-xs hidden lg:table-cell whitespace-nowrap">{formatDate(p.startDate)} - {formatDate(p.endDate)}</td>
                    <td className="py-3 px-2"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(p); setForm({ ...p, client: p.client?._id || p.client, assignedTeam: p.assignedTeam?.map((t) => t._id || t) || [] }); setShowModal(true); }} className="p-1.5 rounded hover:bg-secondary-100"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </TableWrapper>
            <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Project' : 'Add Project'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Project Name</label><input type="text" required value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Client</label>
              <select required value={form.client} onChange={(e) => handleClientChange(e.target.value)} className="input-field">
                <option value="">Select client</option>
                {clients.map((c) => <option key={c._id} value={c._id}>{c.clientName} - {c.companyName}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1.5">Start Date</label><input type="date" required value={form.startDate?.split('T')[0] || form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1.5">End Date</label><input type="date" value={form.endDate?.split('T')[0] || form.endDate || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Budget (₹)</label><input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Assigned Team</label>
            <select multiple value={form.assignedTeam} onChange={(e) => setForm({ ...form, assignedTeam: Array.from(e.target.selectedOptions, (o) => o.value) })} className="input-field h-24">
              {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
