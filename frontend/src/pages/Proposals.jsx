import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, FileText, Download } from 'lucide-react';
import { proposalsAPI, leadsAPI } from '../services/api';
import { PROPOSAL_STATUSES, formatCurrency, formatDate } from '../utils/helpers';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { PageHeader, Pagination } from '../components/common/PageElements';

const Proposals = () => {
  const [proposals, setProposals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', amount: '', lead: '', status: 'Draft', notes: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await proposalsAPI.getAll({ page, limit: 10 });
      setProposals(data.proposals);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to fetch proposals'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => { leadsAPI.getAll({ limit: 100 }).then(({ data }) => setLeads(data.leads)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    Object.keys(form).forEach((k) => formData.append(k, form[k]));
    if (pdfFile) formData.append('pdf', pdfFile);
    try {
      if (editing) { await proposalsAPI.update(editing._id, formData); toast.success('Updated'); }
      else { await proposalsAPI.create(formData); toast.success('Created'); }
      setShowModal(false);
      fetchData();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await proposalsAPI.delete(id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <PageHeader title="Proposals" subtitle="Manage client proposals" action={
        <button onClick={() => { setEditing(null); setForm({ title: '', amount: '', lead: '', status: 'Draft', notes: '' }); setPdfFile(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Proposal
        </button>
      } />

      <div className="card overflow-x-auto">
        {loading ? <TableSkeleton cols={6} /> : proposals.length === 0 ? (
          <EmptyState icon={FileText} title="No proposals" description="Create your first proposal" />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 dark:border-secondary-700">
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Title</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Lead</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Amount</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Date</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-secondary-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p._id} className="border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30">
                    <td className="py-3 px-2 font-medium">{p.title}</td>
                    <td className="py-3 px-2">{p.lead?.leadName || '-'}</td>
                    <td className="py-3 px-2">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-2 text-secondary-500">{formatDate(p.proposalDate)}</td>
                    <td className="py-3 px-2"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-1">
                        {p.pdfFile && <a href={`/uploads/${p.pdfFile}`} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-secondary-100"><Download className="w-4 h-4" /></a>}
                        <button onClick={() => { setEditing(p); setForm({ title: p.title, amount: p.amount, lead: p.lead?._id || p.lead, status: p.status, notes: p.notes }); setShowModal(true); }} className="p-1.5 rounded hover:bg-secondary-100"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Proposal' : 'Add Proposal'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Title</label><input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Lead</label>
            <select required value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })} className="input-field" disabled={!!editing}>
              <option value="">Select lead</option>
              {leads.map((l) => <option key={l._id} value={l._id}>{l.leadName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Amount (₹)</label><input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                {PROPOSAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Notes</label><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" /></div>
          <div><label className="block text-sm font-medium mb-1.5">PDF File</label><input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} className="input-field" /></div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Proposals;
