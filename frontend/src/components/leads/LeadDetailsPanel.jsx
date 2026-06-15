import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Mail, Phone, MapPin, Building, Calendar, User, Briefcase, Tag, Globe, UserCheck, FileText, Instagram, Trash2, Undo2, ThumbsUp, ThumbsDown, LogIn, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { leadsAPI } from '../../services/api';
import { formatCurrency, formatDate, displayValue, displayLeadEmail, companyNameToInstagramHandle, FOLLOWUP_LEAD_STATUS, NOT_INTERESTED_STATUS, LEAD_PENDING_STATUS } from '../../utils/helpers';
import StatusBadge from '../common/StatusBadge';
import CallButton from '../common/CallButton';
import InstagramButton from '../common/InstagramButton';
import LoadingSpinner from '../common/LoadingSpinner';

const InfoField = ({ icon: Icon, label, value, span = 1 }) => (
  <div className={`min-w-0 ${span === 2 ? 'col-span-2' : ''}`}>
    <div className="flex items-start gap-2">
      {Icon && <Icon className="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-secondary-500">{label}</p>
        <p className="text-sm font-medium break-words leading-snug">{value || ''}</p>
      </div>
    </div>
  </div>
);

const LeadDetailsPanel = ({ leadId, embedded = false, onClose, onUpdated }) => {
  const { canViewAllLeads, isAdmin, isLeadManager } = useAuth();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movingBack, setMovingBack] = useState(false);
  const [updatingInterest, setUpdatingInterest] = useState(false);
  const [markingClient, setMarkingClient] = useState(false);

  useEffect(() => {
    if (!leadId) return;
    setLoading(true);
    const fetchLead = async () => {
      try {
        const { data } = await leadsAPI.getById(leadId);
        setLead(data);
      } catch {
        toast.error('Failed to load lead');
        setLead(null);
      }
      setLoading(false);
    };
    fetchLead();
  }, [leadId]);

  const finishAction = (path) => {
    onUpdated?.();
    if (embedded) {
      onClose?.();
    } else if (path) {
      navigate(path);
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center ${embedded ? 'py-12' : 'py-20'}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!lead) {
    return <div className={`text-center ${embedded ? 'py-12' : 'py-20'}`}>Lead not found</div>;
  }

  const isFollowupLead = lead.status === FOLLOWUP_LEAD_STATUS || lead.status === NOT_INTERESTED_STATUS;
  const isInterestedLead = lead.status === FOLLOWUP_LEAD_STATUS;

  const handleClientFollowup = async (type) => {
    setMarkingClient(true);
    try {
      await leadsAPI.markClientFollowup(lead._id, { type });
      toast.success(`Added to Proposals (${type})`);
      finishAction('/followup-leads');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update client follow-up');
    }
    setMarkingClient(false);
  };

  const handleMoveToLeads = async () => {
    setMovingBack(true);
    try {
      await leadsAPI.update(lead._id, { status: LEAD_PENDING_STATUS });
      toast.success('Lead moved back to Leads');
      finishAction('/leads');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to move lead');
    }
    setMovingBack(false);
  };

  const handleInterest = async (interested) => {
    const newStatus = interested ? FOLLOWUP_LEAD_STATUS : NOT_INTERESTED_STATUS;
    if (lead.status === newStatus) return;
    setUpdatingInterest(true);
    try {
      await leadsAPI.update(lead._id, { status: newStatus });
      toast.success(interested ? 'Lead moved to Followup Leads' : 'Moved to Followup Leads (Not Interested)');
      finishAction('/followup-leads');
    } catch {
      toast.error('Failed to update interest');
    }
    setUpdatingInterest(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this lead?')) return;
    try {
      await leadsAPI.delete(lead._id);
      toast.success('Lead deleted');
      finishAction(isFollowupLead ? '/followup-leads' : '/leads');
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const email = displayLeadEmail(lead.email);
  const fields = [
    { icon: Building, label: 'Company', value: displayValue(lead.companyName), span: 2 },
    { icon: Phone, label: 'Mobile', value: displayValue(lead.mobileNumber) },
    { icon: Instagram, label: 'Instagram', value: displayValue(lead.instagramId || companyNameToInstagramHandle(lead.companyName)) },
    { icon: Briefcase, label: 'Business Type', value: displayValue(lead.businessType) },
    { icon: FileText, label: 'Notes', value: displayValue(lead.notes), span: 2 },
    { icon: Tag, label: 'Requirement', value: displayValue(lead.requirementType), span: 2 },
    { icon: Calendar, label: 'Created', value: formatDate(lead.createdAt) },
    { icon: User, label: 'Emp Name', value: displayValue(lead.createdBy?.name || lead.leadName) },
    ...(email ? [{ icon: Mail, label: 'Email', value: email, span: 2 }] : []),
    { icon: MapPin, label: 'City', value: displayValue(lead.city) },
    { icon: MapPin, label: 'State', value: displayValue(lead.state) },
    { icon: Globe, label: 'Source', value: displayValue(lead.leadSource) },
    { icon: UserCheck, label: 'Assigned To', value: displayValue(lead.assignedTo?.name) },
    ...(lead.revenue ? [{ icon: Tag, label: 'Revenue', value: formatCurrency(lead.revenue) }] : []),
  ];

  return (
    <div>
      {!embedded && (
        <Link to={isFollowupLead ? '/followup-leads' : '/leads'} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to {isFollowupLead ? 'Followup Leads' : 'Leads'}
        </Link>
      )}

      <div className={`${embedded ? '' : 'card mb-4'}`}>
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold line-clamp-2 leading-tight">{lead.companyName}</h1>
            <p className="text-secondary-500 text-xs sm:text-sm mt-1 truncate">
              {displayValue(lead.createdBy?.name || lead.leadName)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canViewAllLeads && lead.mobileNumber && (
              <CallButton phone={lead.mobileNumber} size="sm" />
            )}
            {canViewAllLeads && (
              <InstagramButton instagramId={lead.instagramId} companyName={lead.companyName} size="sm" />
            )}
            {canViewAllLeads && isFollowupLead && (
              <button
                type="button"
                onClick={handleMoveToLeads}
                disabled={movingBack}
                title="Move back to Leads"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-primary-50 text-primary hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Leads
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              title="Delete lead"
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <StatusBadge status={lead.status} />
          </div>
        </div>

        {canViewAllLeads && !isFollowupLead && (
          <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-secondary-100 dark:border-secondary-700">
            <button
              type="button"
              onClick={() => handleInterest(true)}
              disabled={updatingInterest}
              className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 disabled:opacity-50"
            >
              <ThumbsUp className="w-4 h-4" />
              Interested
            </button>
            <button
              type="button"
              onClick={() => handleInterest(false)}
              disabled={updatingInterest}
              className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 disabled:opacity-50"
            >
              <ThumbsDown className="w-4 h-4" />
              Not Interested
            </button>
          </div>
        )}

        {isInterestedLead && isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-secondary-100 dark:border-secondary-700">
            <button
              type="button"
              onClick={() => handleClientFollowup('IN')}
              disabled={markingClient}
              className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              IN
            </button>
            <button
              type="button"
              onClick={() => handleClientFollowup('OUT')}
              disabled={markingClient}
              className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              OUT
            </button>
          </div>
        )}

        {isInterestedLead && isLeadManager && (
          <div className="mt-3 pt-3 border-t border-secondary-100 dark:border-secondary-700">
            <p className="text-xs text-secondary-500 mb-1.5">Client Follow-up</p>
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
          </div>
        )}
      </div>

      <div className={embedded ? 'pt-4 border-t border-secondary-100 dark:border-secondary-700' : 'card'}>
        <h3 className="font-semibold mb-3 text-sm sm:text-base">Lead Information</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {fields.map((item) => (
            <InfoField key={item.label} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsPanel;
