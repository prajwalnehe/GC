import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Edit, Eye, ArrowUpDown, UserCheck } from 'lucide-react';
import { leadsAPI, usersAPI } from '../services/api';
import { LEAD_SOURCES, FOLLOWUP_LEAD_STATUS, formatDate } from '../utils/helpers';
import Modal from '../components/common/Modal';
import LeadForm from '../components/leads/LeadForm';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { PageHeader, SearchBar, Pagination } from '../components/common/PageElements';

const FollowupLeads = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await leadsAPI.getAll({
        search,
        status: FOLLOWUP_LEAD_STATUS,
        leadSource: sourceFilter,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      });
      setLeads(data.leads);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to fetch followup leads');
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [search, sourceFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    usersAPI.getAll().then(({ data }) => setUsers(data)).catch(() => {});
  }, []);

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setForm({ ...lead, assignedTo: lead.assignedTo?._id || lead.assignedTo || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await leadsAPI.update(editingLead._id, form);
      toast.success('Lead updated');
      setShowModal(false);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update lead');
    }
    setSaving(false);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div>
      <PageHeader
        title="Followup Leads"
        subtitle={`${total} interested leads`}
      />

      <div className="card mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
        <p className="text-sm text-emerald-800 dark:text-emerald-200">
          Leads with status <strong>Interested</strong> appear here. Edit a lead from the Leads page and set status to Interested to add them.
        </p>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search interested leads..." />
          <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Sources</option>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); }} className="input-field">
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="leadName-asc">Name A-Z</option>
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <TableSkeleton />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No interested leads"
            description="Mark leads as Interested from the Leads page to see them here"
            action={<Link to="/leads" className="btn-primary">Go to Leads</Link>}
          />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 dark:border-secondary-700">
                  {[
                    { key: 'leadName', label: 'Lead Person Name' },
                    { key: 'companyName', label: 'Company' },
                    { key: 'mobileNumber', label: 'Mobile' },
                    { key: 'state', label: 'State' },
                    { key: 'createdAt', label: 'Date' },
                  ].map((col) => (
                    <th key={col.key} className="text-left py-3 px-2 font-medium text-secondary-500 cursor-pointer hover:text-primary" onClick={() => toggleSort(col.key)}>
                      <span className="flex items-center gap-1">{col.label} <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                  ))}
                  <th className="text-left py-3 px-2 font-medium text-secondary-500">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-secondary-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30">
                    <td className="py-3 px-2 font-medium">{lead.leadName}</td>
                    <td className="py-3 px-2">{lead.companyName}</td>
                    <td className="py-3 px-2 text-secondary-500">{lead.mobileNumber}</td>
                    <td className="py-3 px-2 text-secondary-500">{lead.state || '-'}</td>
                    <td className="py-3 px-2 text-secondary-500">{formatDate(lead.createdAt)}</td>
                    <td className="py-3 px-2"><StatusBadge status={lead.status} /></td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/leads/${lead._id}`} className="p-1.5 rounded hover:bg-secondary-100 dark:hover:bg-secondary-600"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => handleEdit(lead)} className="p-1.5 rounded hover:bg-secondary-100 dark:hover:bg-secondary-600"><Edit className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Edit Lead" size="lg">
        <LeadForm form={form} setForm={setForm} users={users} onSubmit={handleSubmit} loading={saving} isEdit />
      </Modal>
    </div>
  );
};

export default FollowupLeads;
