import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Mail, Phone, MapPin, Building, Calendar, User, Briefcase, Tag, Globe, UserCheck, FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { leadsAPI } from '../services/api';
import { formatCurrency, formatDate, displayValue, displayLeadEmail } from '../utils/helpers';
import StatusBadge from '../components/common/StatusBadge';
import CallButton from '../components/common/CallButton';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

const LeadDetails = () => {
  const { canViewAllLeads } = useAuth();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const { data } = await leadsAPI.getById(id);
        setLead(data);
      } catch {
        toast.error('Failed to load lead');
      }
      setLoading(false);
    };
    fetchLead();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!lead) return <div className="text-center py-20">Lead not found</div>;

  const email = displayLeadEmail(lead.email);
  const fields = [
    { icon: Building, label: 'Company', value: displayValue(lead.companyName), span: 2 },
    { icon: Phone, label: 'Mobile', value: displayValue(lead.mobileNumber) },
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
      <Link to="/leads" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </Link>

      <div className="card mb-4">
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
            <StatusBadge status={lead.status} />
          </div>
        </div>
      </div>

      <div className="card">
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

export default LeadDetails;
