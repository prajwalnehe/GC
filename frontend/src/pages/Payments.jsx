import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, CreditCard } from 'lucide-react';
import { paymentsAPI, clientsAPI, projectsAPI } from '../services/api';
import { PAYMENT_STATUSES, formatCurrency, formatDate } from '../utils/helpers';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { PageHeader, Pagination, TableWrapper } from '../components/common/PageElements';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ client: '', clientName: '', project: '', totalAmount: '', advancePaid: '', dueDate: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await paymentsAPI.getAll({ page, limit: 10 });
      setPayments(data.payments);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to fetch payments'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => {
    clientsAPI.getAll({ limit: 100 }).then(({ data }) => setClients(data.clients)).catch(() => {});
    projectsAPI.getAll({ limit: 100 }).then(({ data }) => setProjects(data.projects)).catch(() => {});
  }, []);

  const handleClientChange = (clientId) => {
    const client = clients.find((c) => c._id === clientId);
    setForm({ ...form, client: clientId, clientName: client?.clientName || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await paymentsAPI.update(editing._id, form); toast.success('Updated'); }
      else { await paymentsAPI.create(form); toast.success('Created'); }
      setShowModal(false);
      fetchData();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await paymentsAPI.delete(id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track client payments" action={
        <button onClick={() => { setEditing(null); setForm({ client: '', clientName: '', project: '', totalAmount: '', advancePaid: '', dueDate: '', notes: '' }); setShowModal(true); }} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Payment
        </button>
      } />

      <div className="card">
        {loading ? <TableSkeleton cols={7} /> : payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments" description="Track your first payment" />
        ) : (
          <>
            <TableWrapper>
            <table className="data-table min-w-[700px]">
              <thead>
                <tr className="border-b border-secondary-100 dark:border-secondary-700">
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Client</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 hidden sm:table-cell">Total</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 hidden md:table-cell">Paid</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 hidden md:table-cell">Remaining</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 hidden lg:table-cell">Due Date</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-secondary-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30">
                    <td className="py-3 px-2 font-medium max-w-[140px] truncate">{p.clientName}</td>
                    <td className="py-3 px-2 hidden sm:table-cell whitespace-nowrap">{formatCurrency(p.totalAmount)}</td>
                    <td className="py-3 px-2 text-green-600 hidden md:table-cell whitespace-nowrap">{formatCurrency(p.advancePaid)}</td>
                    <td className="py-3 px-2 text-red-500 hidden md:table-cell whitespace-nowrap">{formatCurrency(p.remainingAmount)}</td>
                    <td className="py-3 px-2 text-secondary-500 hidden lg:table-cell whitespace-nowrap">{formatDate(p.dueDate)}</td>
                    <td className="py-3 px-2"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(p); setForm({ ...p, client: p.client?._id || p.client, project: p.project?._id || p.project || '' }); setShowModal(true); }} className="p-1.5 rounded hover:bg-secondary-100"><Edit className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Payment' : 'Add Payment'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Client</label>
              <select required value={form.client} onChange={(e) => handleClientChange(e.target.value)} className="input-field">
                <option value="">Select client</option>
                {clients.map((c) => <option key={c._id} value={c._id}>{c.clientName}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1.5">Project (optional)</label>
              <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className="input-field">
                <option value="">Select project</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.projectName}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1.5">Total Amount (₹)</label><input type="number" required value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Advance Paid (₹)</label><input type="number" value={form.advancePaid} onChange={(e) => setForm({ ...form, advancePaid: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Due Date</label><input type="date" required value={form.dueDate?.split('T')[0] || form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Notes</label><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" /></div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
