import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, FileText, Download } from 'lucide-react';
import { proposalsAPI, leadsAPI } from '../services/api';
import { PROPOSAL_TYPES, formatCurrency, formatDate, displayValue } from '../utils/helpers';
import Modal from '../components/common/Modal';
import ProposalStatusSelect from '../components/common/ProposalStatusSelect';
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
  const [form, setForm] = useState({ title: '', amount: '', lead: '', status: 'Pending', proposalType: 'Pending', notes: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(null);

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

  const handleFieldUpdate = async (proposal, field, value) => {
    if (proposal[field] === value) return;
    setUpdating(`${proposal._id}-${field}`);
    const formData = new FormData();
    formData.append(field, value);
    if (field === 'proposalType') {
      const baseTitle = proposal.title.replace(/ - (Pending|IN|OUT)$/, '');
      formData.append('title', `${baseTitle} - ${value}`);
    }
    try {
      const { data } = await proposalsAPI.update(proposal._id, formData);
      setProposals((prev) => prev.map((p) => (p._id === proposal._id ? data : p)));
      toast.success(
        field === 'status' && value === 'Approved' ? 'Added to Clients'
          : field === 'proposalType' ? 'Type updated' : 'Status updated'
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
      fetchData();
    }
    setUpdating(null);
  };

  return (
    <div>
      <PageHeader title="Proposals" subtitle="Manage client proposals" action={
        <button onClick={() => { setEditing(null); setForm({ title: '', amount: '', lead: '', status: 'Pending', proposalType: 'Pending', notes: '' }); setPdfFile(null); setShowModal(true); }} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Proposal
        </button>
      } />

      <div className="card overflow-y-visible">
        {loading ? <TableSkeleton cols={7} /> : proposals.length === 0 ? (
          <EmptyState icon={FileText} title="No proposals" description="Create your first proposal" />
        ) : (
          <>
            <div className="w-full overflow-x-auto lg:overflow-visible">
            <table className="w-full text-sm min-w-[700px] lg:min-w-0">
              <thead>
                <tr className="border-b border-secondary-100 dark:border-secondary-700">
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 whitespace-nowrap">Title</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 whitespace-nowrap">Lead</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 whitespace-nowrap">Type</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 whitespace-nowrap">Amount</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 whitespace-nowrap">Date</th>
                  <th className="text-left py-3 px-2 font-medium text-secondary-500 whitespace-nowrap">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-secondary-500 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p._id} className="border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30">
                    <td className="py-3 px-2 font-medium max-w-[140px] lg:max-w-[180px] truncate">{p.title}</td>
                    <td className="py-3 px-2 max-w-[100px] lg:max-w-[120px] truncate">{displayValue(p.lead?.leadName)}</td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <select
                        value={p.proposalType || 'Pending'}
                        disabled={updating === `${p._id}-proposalType`}
                        onChange={(e) => handleFieldUpdate(p, 'proposalType', e.target.value)}
                        className={`input-field py-1.5 px-2 text-xs min-w-[88px] font-medium ${
                          (p.proposalType || 'Pending') === 'IN'
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : (p.proposalType || 'Pending') === 'OUT'
                              ? 'text-red-700 dark:text-red-300'
                              : 'text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {PROPOSAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-2 text-secondary-500 whitespace-nowrap">{formatDate(p.proposalDate)}</td>
                    <td className="py-3 px-2 overflow-visible whitespace-nowrap">
                      <ProposalStatusSelect
                        value={p.status}
                        disabled={updating === `${p._id}-status`}
                        onChange={(status) => handleFieldUpdate(p, 'status', status)}
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-1 whitespace-nowrap">
                        {p.pdfFile && <a href={`/uploads/${p.pdfFile}`} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-secondary-100"><Download className="w-4 h-4" /></a>}
                        <button onClick={() => { setEditing(p); setForm({ title: p.title, amount: p.amount, lead: p.lead?._id || p.lead, status: p.status, proposalType: p.proposalType || 'Pending', notes: p.notes }); setShowModal(true); }} className="p-1.5 rounded hover:bg-secondary-100"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Amount (₹)</label><input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Type</label>
              <select value={form.proposalType} onChange={(e) => setForm({ ...form, proposalType: e.target.value })} className="input-field">
                {PROPOSAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Status</label>
            <ProposalStatusSelect
              fullWidth
              value={form.status}
              onChange={(status) => setForm({ ...form, status })}
            />
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
