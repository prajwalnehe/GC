import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, Calendar } from 'lucide-react';
import { followUpsAPI, leadsAPI } from '../services/api';
import { REMINDER_STATUSES, formatDate } from '../utils/helpers';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { PageHeader, Pagination } from '../components/common/PageElements';

const FollowUps = () => {
  const [followUps, setFollowUps] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ followUpDate: '', followUpTime: '', notes: '', reminder: true, lead: '', reminderStatus: 'Pending' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await followUpsAPI.getAll({ reminderStatus: statusFilter, clientType: 'IN', page, limit: 10 });
      setFollowUps(data.followUps);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to fetch follow-ups'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);
  useEffect(() => { leadsAPI.getAll({ limit: 100 }).then(({ data }) => setLeads(data.leads)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await followUpsAPI.update(editing._id, form);
        toast.success('Follow-up updated');
      } else {
        await followUpsAPI.create({ ...form, clientType: 'IN' });
        toast.success('Follow-up created');
      }
      setShowModal(false);
      fetchData();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this follow-up?')) return;
    try { await followUpsAPI.delete(id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <PageHeader title="final Client followup (IN)" subtitle="Manage lead follow-up schedules" action={
        <button onClick={() => { setEditing(null); setForm({ followUpDate: '', followUpTime: '', notes: '', reminder: true, lead: '', reminderStatus: 'Pending' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Follow-up
        </button>
      } />

      <div className="card mb-6">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field max-w-xs">
          <option value="">All Statuses</option>
          {REMINDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <TableSkeleton cols={5} /> : followUps.length === 0 ? (
          <EmptyState icon={Calendar} title="No follow-ups" description="Schedule your first follow-up" />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 dark:border-secondary-700">
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Lead</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Date & Time</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Notes</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-secondary-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((fu) => (
                  <tr key={fu._id} className="border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30">
                    <td className="py-3 px-2 font-medium">{fu.lead?.leadName || '-'}</td>
                    <td className="py-3 px-2">{formatDate(fu.followUpDate)} {fu.followUpTime}</td>
                    <td className="py-3 px-2 text-secondary-500 max-w-xs truncate">{fu.notes}</td>
                    <td className="py-3 px-2"><StatusBadge status={fu.reminderStatus} /></td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(fu); setForm({ ...fu, lead: fu.lead?._id || fu.lead }); setShowModal(true); }} className="p-1.5 rounded hover:bg-secondary-100"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(fu._id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Follow-up' : 'Add Follow-up'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Lead</label>
            <select required value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} className="input-field" disabled={!!editing}>
              <option value="">Select lead</option>
              {leads.map((l) => <option key={l._id} value={l._id}>{l.leadName} - {l.companyName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Date</label><input type="date" required value={form.followUpDate?.split('T')[0] || form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Time</label><input type="time" required value={form.followUpTime} onChange={(e) => setForm({ ...form, followUpTime: e.target.value })} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Notes</label><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" /></div>
          {editing && (
            <div><label className="block text-sm font-medium mb-1.5">Reminder Status</label>
              <select value={form.reminderStatus} onChange={(e) => setForm({ ...form, reminderStatus: e.target.value })} className="input-field">
                {REMINDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.reminder} onChange={(e) => setForm({ ...form, reminder: e.target.checked })} /> Set reminder</label>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default FollowUps;
