import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Download, Trash2, Edit, Eye, ArrowUpDown, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { leadsAPI, usersAPI } from '../services/api';
import { LEAD_SOURCES, FOLLOWUP_LEAD_STATUS, NOT_INTERESTED_STATUS, LEAD_PENDING_STATUS, LEAD_DATE_FILTERS, displayValue, getLeadStatusForSalesExecutive } from '../utils/helpers';
import Modal from '../components/common/Modal';
import LeadForm from '../components/leads/LeadForm';
import StatusBadge from '../components/common/StatusBadge';
import CallButton from '../components/common/CallButton';
import InstagramButton from '../components/common/InstagramButton';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { SearchBar, Pagination, PageHeader } from '../components/common/PageElements';
import { Users } from 'lucide-react';

const Leads = () => {
  const navigate = useNavigate();
  const { canViewAllLeads, user } = useAuth();
  const isSalesExecutive = user?.role === 'Sales Executive';
  const canAddLead = ['Admin', 'Lead Manager', 'Sales Executive'].includes(user?.role);
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
        payload.email = `${form.mobileNumber.replace(/\D/g, '')}@leadcrm.local`;
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
      const { data } = await leadsAPI.exportExcel();
      const url = window.URL.createObjectURL(
        new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads-export.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Excel file downloaded');
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
      <PageHeader title="Leads" />

      <div className="card mb-4 sm:mb-6 space-y-3">
        <div className="flex flex-row flex-nowrap items-center gap-2 min-w-0">
          <button onClick={handleExport} className="btn-secondary flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 px-2.5 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          {canAddLead && (
            <button onClick={handleCreate} className="btn-primary flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 px-2.5 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm">
              <Plus className="w-4 h-4" /> Add Lead
            </button>
          )}
          <div className="flex-1 min-w-0">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search leads..." />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} className="input-field w-full text-xs sm:text-sm min-w-0">
            <option value="">All Sources</option>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="input-field w-full text-xs sm:text-sm min-w-0">
            {LEAD_DATE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); }} className="input-field w-full text-xs sm:text-sm min-w-0">
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="leadName-asc">Emp Name A-Z</option>
          </select>
        </div>
      </div>

      <div className="card">
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
            <div className="w-full overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="border-b border-secondary-100 dark:border-secondary-700">
                  {[
                    { key: 'companyName', label: 'Company' },
                    { key: 'mobileNumber', label: 'Mobile' },
                  ].map((col) => (
                    <th key={col.key} className="text-left py-3 px-2 font-medium text-secondary-500 cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => toggleSort(col.key)}>
                      <span className="flex items-center gap-1">{col.label} <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                  ))}
                  {canViewAllLeads && (
                    <th className="text-left py-3 px-2 font-medium text-secondary-500 whitespace-nowrap">Call / Insta</th>
                  )}
                  {[
                    { key: 'businessType', label: 'Business Type' },
                    { key: 'leadName', label: 'Emp Name' },
                    { key: 'status', label: 'Status' },
                    { key: 'createdAt', label: 'Date' },
                  ].map((col) => (
                    <th key={col.key} className="text-left py-3 px-2 font-medium text-secondary-500 cursor-pointer hover:text-primary whitespace-nowrap" onClick={() => toggleSort(col.key)}>
                      <span className="flex items-center gap-1">{col.label} <ArrowUpDown className="w-3 h-3" /></span>
                    </th>
                  ))}
                  {canViewAllLeads && (
                    <th className="text-left py-3 px-2 font-medium text-secondary-500 whitespace-nowrap">Interest</th>
                  )}
                  <th className="text-right py-3 px-2 font-medium text-secondary-500 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => {
                      if (window.innerWidth < 1024) navigate(`/leads/${lead._id}`);
                    }}
                    className="border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30 cursor-pointer lg:cursor-default"
                  >
                    <td className="py-3 px-2 font-medium text-xs sm:text-sm max-w-[120px] sm:max-w-[160px] leading-tight">
                      <span className="line-clamp-2 break-words">{lead.companyName}</span>
                    </td>
                    <td className="py-3 px-2 text-secondary-500 whitespace-nowrap">{lead.mobileNumber}</td>
                    {canViewAllLeads && (
                      <td className="py-3 px-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <CallButton phone={lead.mobileNumber} size="sm" />
                          <InstagramButton instagramId={lead.instagramId} companyName={lead.companyName} size="sm" />
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-2 text-secondary-500 whitespace-nowrap">{displayValue(lead.businessType)}</td>
                    <td className="py-3 px-2 font-medium text-xs sm:text-sm max-w-[90px] sm:max-w-[110px] leading-tight align-top">
                      {(() => {
                        const empName = displayValue(lead.createdBy?.name || lead.leadName);
                        const parts = empName.split(/\s+/).filter(Boolean);
                        const mid = Math.ceil(parts.length / 2);
                        const line1 = parts.slice(0, mid).join(' ') || empName;
                        const line2 = parts.length > 1 ? parts.slice(mid).join(' ') : '';
                        return (
                          <span className="inline-block">
                            <span className="block break-words">{line1}</span>
                            {line2 && <span className="block break-words text-secondary-600 dark:text-secondary-400">{line2}</span>}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <StatusBadge status={isSalesExecutive ? getLeadStatusForSalesExecutive(lead.status) : lead.status} />
                    </td>
                    <td className="py-3 px-2 text-secondary-500 text-xs sm:text-sm max-w-[56px] sm:max-w-[64px] leading-tight">
                      {lead.createdAt ? (
                        <span className="inline-block">
                          <span className="block">{new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                          <span className="block">{new Date(lead.createdAt).getFullYear()}</span>
                        </span>
                      ) : null}
                    </td>
                    {canViewAllLeads && (
                      <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-start gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleInterest(lead, true)}
                            disabled={updatingInterest === lead._id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
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
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
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
                    <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <Link to={`/leads/${lead._id}`} className="p-1.5 rounded hover:bg-secondary-100 dark:hover:bg-secondary-600"><Eye className="w-4 h-4" /></Link>
                        <button type="button" onClick={() => handleEdit(lead)} className="p-1.5 rounded hover:bg-secondary-100 dark:hover:bg-secondary-600"><Edit className="w-4 h-4" /></button>
                        <button type="button" onClick={() => handleDelete(lead._id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingLead ? 'Edit Lead' : 'Create Lead'} size="lg">
        <LeadForm form={form} setForm={setForm} users={users} onSubmit={handleSubmit} loading={saving} isEdit={!!editingLead} />
      </Modal>
    </div>
  );
};

export default Leads;
