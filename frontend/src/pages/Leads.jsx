import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Download, Trash2, Edit, Eye, ArrowUpDown, ThumbsUp, ThumbsDown, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { leadsAPI, usersAPI } from '../services/api';
import { LEAD_SOURCES, FOLLOWUP_LEAD_STATUS, NOT_INTERESTED_STATUS, LEAD_PENDING_STATUS, LEAD_DATE_FILTERS, formatDate, displayValue, getLeadStatusForSalesExecutive } from '../utils/helpers';
import Modal from '../components/common/Modal';
import LeadForm from '../components/leads/LeadForm';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { SearchBar, Pagination } from '../components/common/PageElements';
import { Users } from 'lucide-react';

const Leads = () => {
  const { canViewAllLeads, isLeadManager, user } = useAuth();
  const isSalesExecutive = user?.role === 'Sales Executive';
  const canAddLead = !isLeadManager;
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [updatingInterest, setUpdatingInterest] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        search, leadSource: sourceFilter, dateFilter, sortBy, sortOrder, page, limit: 10,
        ...(canViewAllLeads ? { mainList: 'true' } : {}),
      };
      const { data } = await leadsAPI.getAll(params);
      const visibleLeads = isSalesExecutive
        ? data.leads
        : data.leads.filter(
          (lead) => lead.status !== FOLLOWUP_LEAD_STATUS && lead.status !== NOT_INTERESTED_STATUS
        );
      setLeads(visibleLeads);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to fetch leads');
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [search, sourceFilter, dateFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    usersAPI.getAll().then(({ data }) => setUsers(data)).catch(() => {});
  }, []);

  const handleCreate = () => {
    setEditingLead(null);
    setForm({
      status: LEAD_PENDING_STATUS,
      leadSource: 'Website',
      requirementType: 'Web Development',
      businessType: 'Other',
      leadName: user?.name || '',
    });
    setShowModal(true);
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setForm({ ...lead, assignedTo: lead.assignedTo?._id || lead.assignedTo || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let payload = { ...form };
      if (!editingLead) {
        payload.leadName = form.leadName;
        payload.contactPerson = form.leadName;
        payload.email = `${form.mobileNumber.replace(/\D/g, '')}@growwcode.local`;
        payload.status = LEAD_PENDING_STATUS;
      } else {
        payload.status = editingLead.status;
      }
      if (editingLead) {
        await leadsAPI.update(editingLead._id, payload);
        toast.success('Lead updated');
      } else {
        await leadsAPI.create(payload);
        toast.success('Lead created');
      }
      setShowModal(false);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lead');
    }
    setSaving(false);
  };

  const handleInterest = async (lead, interested) => {
    const newStatus = interested ? FOLLOWUP_LEAD_STATUS : NOT_INTERESTED_STATUS;
    if (lead.status === newStatus) return;
    setUpdatingInterest(lead._id);
    try {
      await leadsAPI.update(lead._id, { status: newStatus });
      setLeads((prev) => prev.filter((l) => l._id !== lead._id));
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success(interested ? 'Lead moved to Followup Leads' : 'Moved to Followup Leads (Not Interested)');
    } catch {
      toast.error('Failed to update interest');
      fetchLeads();
    }
    setUpdatingInterest(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await leadsAPI.delete(id);
      toast.success('Lead deleted');
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await leadsAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads-export.csv';
      a.click();
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
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
      <div className="mb-6 flex flex-row flex-nowrap items-center gap-3 overflow-x-auto">
        <h1 className="text-2xl font-bold text-secondary-800 dark:text-secondary-100 shrink-0 whitespace-nowrap">
          Leads
        </h1>
        <div className="flex-[2] min-w-[180px]">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search leads..." />
        </div>
        <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} className="input-field min-w-[140px] flex-1">
          <option value="">All Sources</option>
          {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="input-field min-w-[120px] flex-1">
          {LEAD_DATE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); }} className="input-field min-w-[140px] flex-1">
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="leadName-asc">Emp Name A-Z</option>
        </select>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2 shrink-0 whitespace-nowrap">
          <Download className="w-4 h-4" /> Export
        </button>
        {canAddLead && (
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2 shrink-0 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        )}
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <TableSkeleton />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No leads found"
            description={canAddLead ? 'Create your first lead to get started' : 'No leads available'}
            action={canAddLead ? <button onClick={handleCreate} className="btn-primary">Add Lead</button> : undefined}
          />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 dark:border-secondary-700">
                  {[
                    { key: 'leadName', label: 'Emp Name' },
                    { key: 'companyName', label: 'Company' },
                    { key: 'businessType', label: 'Business Type' },
                    { key: 'mobileNumber', label: 'Mobile' },
                    { key: 'status', label: 'Status' },
                    { key: 'createdAt', label: 'Date' },
                  ].map((col) => (
                    <th key={col.key} className="text-left py-3 px-2 font-medium text-secondary-500 cursor-pointer hover:text-primary" onClick={() => toggleSort(col.key)}>
                      <span className="flex items-center gap-1">{col.label} <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                  ))}
                  {canViewAllLeads && (
                    <th className="text-left py-3 px-2 font-medium text-secondary-500">Interest</th>
                  )}
                  <th className="text-right py-3 px-2 font-medium text-secondary-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30">
                    <td className="py-3 px-2 font-medium">{displayValue(lead.createdBy?.name || lead.leadName)}</td>
                    <td className="py-3 px-2">{lead.companyName}</td>
                    <td className="py-3 px-2 text-secondary-500">{displayValue(lead.businessType)}</td>
                    <td className="py-3 px-2 text-secondary-500">{lead.mobileNumber}</td>
                    <td className="py-3 px-2">
                      <StatusBadge status={isSalesExecutive ? getLeadStatusForSalesExecutive(lead.status) : lead.status} />
                    </td>
                    <td className="py-3 px-2 text-secondary-500">{formatDate(lead.createdAt)}</td>
                    {canViewAllLeads && (
                      <td className="py-3 px-2">
                        <div className="flex flex-col items-start gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleInterest(lead, true)}
                            disabled={updatingInterest === lead._id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              lead.status === FOLLOWUP_LEAD_STATUS
                                ? 'bg-emerald-500 text-white'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Interested
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInterest(lead, false)}
                            disabled={updatingInterest === lead._id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              lead.status === NOT_INTERESTED_STATUS
                                ? 'bg-red-500 text-white'
                                : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            Not Interested
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        {canViewAllLeads && lead.mobileNumber && (
                          <a
                            href={`tel:${lead.mobileNumber.replace(/\D/g, '')}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Call
                          </a>
                        )}
                        <Link to={`/leads/${lead._id}`} className="p-1.5 rounded hover:bg-secondary-100 dark:hover:bg-secondary-600"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => handleEdit(lead)} className="p-1.5 rounded hover:bg-secondary-100 dark:hover:bg-secondary-600"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(lead._id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingLead ? 'Edit Lead' : 'Create Lead'} size="lg">
        <LeadForm form={form} setForm={setForm} users={users} onSubmit={handleSubmit} loading={saving} isEdit={!!editingLead} />
      </Modal>
    </div>
  );
};

export default Leads;
