import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Edit, Eye, ArrowUpDown, UserCheck, LogIn, LogOut, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { leadsAPI, usersAPI } from '../services/api';
import { LEAD_SOURCES, FOLLOWUP_LEAD_STATUS, NOT_INTERESTED_STATUS, LEAD_PENDING_STATUS, LEAD_DATE_FILTERS, displayValue } from '../utils/helpers';
import Modal from '../components/common/Modal';
import LeadForm from '../components/leads/LeadForm';
import LeadDetailsModal from '../components/leads/LeadDetailsModal';
import CallButton from '../components/common/CallButton';
import InstagramButton from '../components/common/InstagramButton';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/Skeleton';
import { SearchBar, Pagination, PageHeader } from '../components/common/PageElements';

const FollowupLeads = () => {
  const { isAdmin, isLeadManager, canViewAllLeads } = useAuth();
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [interestFilter, setInterestFilter] = useState(FOLLOWUP_LEAD_STATUS);
  const [sourceFilter, setSourceFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [viewLeadId, setViewLeadId] = useState(null);
  const [markingClient, setMarkingClient] = useState(null);
  const [movingBack, setMovingBack] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await leadsAPI.getAll({
        search,
        status: interestFilter,
        leadSource: sourceFilter,
        dateFilter,
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

  useEffect(() => { fetchLeads(); }, [search, interestFilter, sourceFilter, dateFilter, sortBy, sortOrder, page]);

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

  const handleClientFollowup = async (lead, type) => {
    setMarkingClient(lead._id);
    try {
      await leadsAPI.markClientFollowup(lead._id, { type });
      setLeads((prev) => prev.filter((l) => l._id !== lead._id));
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success(`Added to Proposals (${type})`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update client follow-up');
      fetchLeads();
    }
    setMarkingClient(null);
  };

  const handleMoveToLeads = async (lead) => {
    setMovingBack(lead._id);
    try {
      await leadsAPI.update(lead._id, { status: LEAD_PENDING_STATUS });
      setLeads((prev) => prev.filter((l) => l._id !== lead._id));
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success('Lead moved back to Leads');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to move lead');
      fetchLeads();
    }
    setMovingBack(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await leadsAPI.delete(id);
      setLeads((prev) => prev.filter((l) => l._id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success('Lead deleted');
    } catch {
      toast.error('Failed to delete lead');
      fetchLeads();
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

  const isInterestedView = interestFilter === FOLLOWUP_LEAD_STATUS;

  const renderEmpName = (lead) => {
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
  };

  return (
    <div>
      <PageHeader title="Followup Leads" />

      <div className="card mb-4 sm:mb-6">
        {/* Mobile */}
        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex flex-row flex-nowrap items-center gap-2">
            <select
              value={interestFilter}
              onChange={(e) => { setInterestFilter(e.target.value); setPage(1); }}
              className="input-field shrink-0 w-[130px] text-xs"
            >
              <option value={FOLLOWUP_LEAD_STATUS}>Interested</option>
              <option value={NOT_INTERESTED_STATUS}>Not Interested</option>
            </select>
            <div className="flex-1 min-w-0">
              <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search leads..." />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} className="input-field w-full text-xs">
              <option value="">All Sources</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="input-field w-full text-xs">
              {LEAD_DATE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); }} className="input-field w-full text-xs">
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="leadName-asc">Name A-Z</option>
            </select>
          </div>
        </div>
        {/* Desktop — one row, no scroll */}
        <div className="hidden lg:flex flex-row items-center gap-3">
          <select
            value={interestFilter}
            onChange={(e) => { setInterestFilter(e.target.value); setPage(1); }}
            className="input-field shrink-0 w-[140px] text-xs"
          >
            <option value={FOLLOWUP_LEAD_STATUS}>Interested</option>
            <option value={NOT_INTERESTED_STATUS}>Not Interested</option>
          </select>
          <div className="flex-1 min-w-[200px]">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search leads..." />
          </div>
          <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} className="input-field shrink-0 w-[150px] text-xs">
            <option value="">All Sources</option>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="input-field shrink-0 w-[120px] text-xs">
            {LEAD_DATE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [f, o] = e.target.value.split('-'); setSortBy(f); setSortOrder(o); }} className="input-field shrink-0 w-[140px] text-xs">
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="leadName-asc">Name A-Z</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title={isInterestedView ? 'No interested leads' : 'No not interested leads'}
            description={isInterestedView
              ? 'Mark leads as Interested from the Leads page to see them here'
              : 'Mark leads as Not Interested from the Leads page to see them here'}
            action={<Link to="/leads" className="btn-primary">Go to Leads</Link>}
          />
        ) : (
          <>
            <div className="w-full overflow-x-auto lg:overflow-visible">
            <table className="w-full text-xs sm:text-sm lg:min-w-0">
              <thead>
                <tr className="border-b border-secondary-100 dark:border-secondary-700">
                  <th className="text-left py-2.5 px-2 text-xs font-medium text-secondary-500 cursor-pointer hover:text-primary" onClick={() => toggleSort('companyName')}>
                    <span className="flex items-center gap-1 whitespace-nowrap">Company <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-left py-2.5 px-2 text-xs font-medium text-secondary-500 cursor-pointer hover:text-primary" onClick={() => toggleSort('leadName')}>
                    <span className="flex items-center gap-1 whitespace-nowrap">Emp Name <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-left py-2.5 px-2 text-xs font-medium text-secondary-500 cursor-pointer hover:text-primary" onClick={() => toggleSort('businessType')}>
                    <span className="flex items-center gap-1 whitespace-nowrap">Business Type <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  {canViewAllLeads && (
                    <th className="text-left py-2.5 px-2 text-xs font-medium text-secondary-500 whitespace-nowrap">Call / Insta</th>
                  )}
                  <th className="hidden lg:table-cell text-left py-2.5 px-2 text-xs font-medium text-secondary-500 cursor-pointer hover:text-primary" onClick={() => toggleSort('mobileNumber')}>
                    <span className="flex items-center gap-1 whitespace-nowrap">Mobile <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="hidden lg:table-cell text-left py-2.5 px-2 text-xs font-medium text-secondary-500 cursor-pointer hover:text-primary" onClick={() => toggleSort('createdAt')}>
                    <span className="flex items-center gap-1 whitespace-nowrap">Date <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="hidden lg:table-cell text-right py-2.5 px-2 text-xs font-medium text-secondary-500 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => setViewLeadId(lead._id)}
                    className="border-b border-secondary-50 dark:border-secondary-700/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/30 cursor-pointer"
                  >
                    <td className="py-2.5 px-2 font-medium text-xs sm:text-sm max-w-[100px] sm:max-w-[140px] leading-tight align-top">
                      <span className="line-clamp-2 break-words">{lead.companyName}</span>
                    </td>
                    <td className="py-2.5 px-2 font-medium text-xs sm:text-sm max-w-[100px] sm:max-w-[120px] leading-tight align-top">
                      {renderEmpName(lead)}
                    </td>
                    <td className="py-2.5 px-2 text-secondary-500 text-xs sm:text-sm max-w-[90px] leading-tight align-top">
                      <span className="line-clamp-2 break-words">{displayValue(lead.businessType)}</span>
                    </td>
                    {canViewAllLeads && (
                      <td className="py-2.5 px-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <CallButton phone={lead.mobileNumber} size="sm" />
                          <InstagramButton instagramId={lead.instagramId} companyName={lead.companyName} size="sm" />
                        </div>
                      </td>
                    )}
                    <td className="hidden lg:table-cell py-2.5 px-2 text-secondary-500 text-xs sm:text-sm whitespace-nowrap">{lead.mobileNumber}</td>
                    <td className="hidden lg:table-cell py-2.5 px-2 text-secondary-500 text-xs sm:text-sm min-w-[50px] leading-tight align-top">
                      {lead.createdAt ? (
                        <span className="inline-block">
                          <span className="block">{new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                          <span className="block">{new Date(lead.createdAt).getFullYear()}</span>
                        </span>
                      ) : null}
                    </td>
                    <td className="hidden lg:table-cell py-2.5 px-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 flex-wrap whitespace-nowrap">
                        {isInterestedView && isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleClientFollowup(lead, 'IN')}
                              disabled={markingClient === lead._id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
                            >
                              <LogIn className="w-3 h-3" />
                              IN
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClientFollowup(lead, 'OUT')}
                              disabled={markingClient === lead._id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300"
                            >
                              <LogOut className="w-3 h-3" />
                              OUT
                            </button>
                          </>
                        )}
                        {isInterestedView && isLeadManager && (
                          <span className={`badge ${
                            lead.clientFollowupType === 'IN'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                              : lead.clientFollowupType === 'OUT'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                          >
                            {lead.clientFollowupType || 'Pending'}
                          </span>
                        )}
                        {canViewAllLeads && (
                          <button
                            type="button"
                            onClick={() => handleMoveToLeads(lead)}
                            disabled={movingBack === lead._id}
                            title="Move back to Leads"
                            className="p-1.5 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                        )}
                        <button type="button" onClick={() => setViewLeadId(lead._id)} className="p-1.5 rounded hover:bg-secondary-100 dark:hover:bg-secondary-600"><Eye className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Edit Lead" size="lg">
        <LeadForm form={form} setForm={setForm} users={users} onSubmit={handleSubmit} loading={saving} isEdit />
      </Modal>

      <LeadDetailsModal
        leadId={viewLeadId}
        isOpen={!!viewLeadId}
        onClose={() => setViewLeadId(null)}
        onUpdated={fetchLeads}
      />
    </div>
  );
};

export default FollowupLeads;
