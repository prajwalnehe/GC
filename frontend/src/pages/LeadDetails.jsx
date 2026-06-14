import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Mail, Phone, MapPin, Building, Calendar, Upload, FileText, Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { leadsAPI, followUpsAPI, proposalsAPI, documentsAPI } from '../services/api';
import { formatCurrency, formatDate, formatDateTime, displayValue } from '../utils/helpers';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

const LeadDetails = () => {
  const { canViewAllLeads } = useAuth();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpForm, setFollowUpForm] = useState({ followUpDate: '', followUpTime: '', notes: '', reminder: true });
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      const [leadRes, fuRes, propRes] = await Promise.all([
        leadsAPI.getById(id),
        followUpsAPI.getAll({ leadId: id }),
        proposalsAPI.getAll({ leadId: id }),
      ]);
      setLead(leadRes.data);
      setFollowUps(fuRes.data.followUps);
      setProposals(propRes.data.proposals);
    } catch {
      toast.error('Failed to load lead');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      await leadsAPI.addNote(id, { content: note });
      setNote('');
      toast.success('Note added');
      fetchData();
    } catch {
      toast.error('Failed to add note');
    }
  };

  const handleFollowUp = async (e) => {
    e.preventDefault();
    try {
      await followUpsAPI.create({ ...followUpForm, lead: id });
      toast.success('Follow-up scheduled');
      setShowFollowUp(false);
      fetchData();
    } catch {
      toast.error('Failed to schedule follow-up');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('type', 'Requirement Documents');
    formData.append('lead', id);
    try {
      await documentsAPI.upload(formData);
      toast.success('Document uploaded');
      fetchData();
    } catch {
      toast.error('Upload failed');
    }
    setUploading(false);
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!lead) return <div className="text-center py-20">Lead not found</div>;

  const infoItems = [
    { icon: Mail, label: 'Email', value: displayValue(lead.email) },
    { icon: Phone, label: 'Phone', value: displayValue(lead.mobileNumber) },
    { icon: MapPin, label: 'City', value: displayValue(lead.city) },
    { icon: MapPin, label: 'State', value: displayValue(lead.state) },
    { icon: Building, label: 'Company', value: displayValue(lead.companyName) },
    { icon: Calendar, label: 'Created', value: formatDate(lead.createdAt) },
  ];

  return (
    <div>
      <Link to="/leads" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">{lead.leadName}</h1>
          <p className="text-secondary-500 text-sm sm:text-base truncate">{lead.contactPerson} · {lead.companyName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {canViewAllLeads && lead.mobileNumber && (
            <a
              href={`tel:${lead.mobileNumber.replace(/\D/g, '')}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          )}
          <StatusBadge status={lead.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Lead Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-secondary-400" />
                  <div>
                    <p className="text-xs text-secondary-500">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
              <div><p className="text-xs text-secondary-500">Source</p><p className="text-sm font-medium">{lead.leadSource}</p></div>
              <div><p className="text-xs text-secondary-500">Business Type</p><p className="text-sm font-medium">{displayValue(lead.businessType)}</p></div>
              <div><p className="text-xs text-secondary-500">Requirement</p><p className="text-sm font-medium">{displayValue(lead.requirementType)}</p></div>
              <div><p className="text-xs text-secondary-500">Assigned To</p><p className="text-sm font-medium">{displayValue(lead.assignedTo?.name)}</p></div>
              <div><p className="text-xs text-secondary-500">Revenue</p><p className="text-sm font-medium">{formatCurrency(lead.revenue)}</p></div>
            </div>
            {lead.notes && (
              <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-700">
                <p className="text-xs text-secondary-500 mb-1">Notes</p>
                <p className="text-sm">{lead.notes}</p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Activity Timeline</h3>
            </div>
            <div className="space-y-4">
              {lead.activities?.length > 0 ? lead.activities.slice().reverse().map((act, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{act.action}</p>
                    <p className="text-xs text-secondary-500">{act.description}</p>
                    <p className="text-xs text-secondary-400 mt-0.5">{formatDateTime(act.createdAt)} · {act.performedBy?.name || 'System'}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-secondary-500">No activities yet</p>}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Notes History</h3>
            <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." className="input-field flex-1 min-w-0" />
              <button type="submit" className="btn-primary flex items-center justify-center gap-2 sm:px-4"><Send className="w-4 h-4" /><span className="sm:hidden">Send</span></button>
            </form>
            <div className="space-y-3">
              {lead.notesHistory?.length > 0 ? lead.notesHistory.slice().reverse().map((n, i) => (
                <div key={i} className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-secondary-400 mt-1">{n.createdBy?.name} · {formatDateTime(n.createdAt)}</p>
                </div>
              )) : <p className="text-sm text-secondary-500">No notes yet</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Follow-ups</h3>
              <button onClick={() => setShowFollowUp(true)} className="text-sm text-primary hover:underline">+ Add</button>
            </div>
            <div className="space-y-3">
              {followUps.map((fu) => (
                <div key={fu._id} className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium">{formatDate(fu.followUpDate)} {fu.followUpTime}</p>
                    <StatusBadge status={fu.reminderStatus} />
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">{fu.notes}</p>
                </div>
              ))}
              {followUps.length === 0 && <p className="text-sm text-secondary-500">No follow-ups</p>}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Proposals</h3>
            <div className="space-y-3">
              {proposals.map((p) => (
                <div key={p._id} className="p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg">
                  <p className="text-sm font-medium">{p.title}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-secondary-500">{formatCurrency(p.amount)}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
              {proposals.length === 0 && <p className="text-sm text-secondary-500">No proposals</p>}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Documents</h3>
              <label className="cursor-pointer text-sm text-primary hover:underline flex items-center gap-1">
                <Upload className="w-3 h-3" /> {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.png,.jpg" />
              </label>
            </div>
            <div className="space-y-2">
              {lead.documents?.map((doc) => (
                <a key={doc._id} href={`/uploads/${doc.filePath}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded hover:bg-secondary-50 dark:hover:bg-secondary-700 text-sm">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="truncate">{doc.originalName || doc.name}</span>
                </a>
              ))}
              {(!lead.documents || lead.documents.length === 0) && <p className="text-sm text-secondary-500">No documents</p>}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showFollowUp} onClose={() => setShowFollowUp(false)} title="Schedule Follow-up">
        <form onSubmit={handleFollowUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Date</label>
            <input type="date" required value={followUpForm.followUpDate} onChange={(e) => setFollowUpForm({ ...followUpForm, followUpDate: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Time</label>
            <input type="time" required value={followUpForm.followUpTime} onChange={(e) => setFollowUpForm({ ...followUpForm, followUpTime: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Notes</label>
            <textarea rows={3} value={followUpForm.notes} onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })} className="input-field resize-none" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={followUpForm.reminder} onChange={(e) => setFollowUpForm({ ...followUpForm, reminder: e.target.checked })} />
            Set reminder
          </label>
          <button type="submit" className="btn-primary w-full">Schedule</button>
        </form>
      </Modal>
    </div>
  );
};

export default LeadDetails;
