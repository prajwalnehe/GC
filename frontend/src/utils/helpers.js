export const LEAD_STATUSES = [
  'Pending',
  'New Lead',
  'Contacted',
  'Interested',
  'Not Interested',
  'Follow-up Required',
  'Meeting Scheduled',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
  'On Hold',
];

export const FOLLOWUP_LEAD_STATUS = 'Interested';
export const NOT_INTERESTED_STATUS = 'Not Interested';
export const LEAD_DATE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
];

export const LEAD_PENDING_STATUS = 'Pending';

export const getLeadStatusForSalesExecutive = (status) => {
  if (status === FOLLOWUP_LEAD_STATUS || status === NOT_INTERESTED_STATUS) return status;
  return LEAD_PENDING_STATUS;
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'LinkedIn',
  'Cold Call',
  'Email Campaign',
  'Social Media',
  'Other',
];

export const BUSINESS_TYPES = [
  'E-commerce',
  'Healthcare',
  'Education',
  'Real Estate',
  'Finance & Banking',
  'Manufacturing',
  'Retail',
  'Hospitality',
  'IT & Software',
  'Marketing & Agency',
  'Logistics',
  'Startup',
  'Other',
];

export const REQUIREMENT_TYPES = [
  'Web Development',
  'Mobile App',
  'UI/UX Design',
  'Cloud Services',
  'DevOps',
  'Consulting',
  'Other',
];

export const PROPOSAL_STATUSES = ['Pending', 'Sent', 'Approved', 'Rejected'];
export const PROPOSAL_TYPES = ['Pending', 'IN', 'OUT'];

export const PROJECT_STATUSES = ['Planning', 'In Progress', 'Testing', 'Completed', 'On Hold'];

export const PAYMENT_STATUSES = ['Pending', 'Partial Paid', 'Paid'];

export const REMINDER_STATUSES = ['Pending', 'Completed', 'Missed'];

export const DOCUMENT_TYPES = [
  'Proposal PDF',
  'Agreement',
  'Invoice',
  'Requirement Documents',
  'Payment Receipt',
  'Other',
];

export const ROLES = ['Admin', 'Sales Executive', 'Lead Manager'];

export const getStatusColor = (status) => {
  const colors = {
    'New Lead': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Contacted': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'Interested': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    'Not Interested': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Follow-up Required': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Meeting Scheduled': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Proposal Sent': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'Negotiation': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Won': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Lost': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'On Hold': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'Sent': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Approved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Planning': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Testing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Partial Paid': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Missed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const displayValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  return value;
};

export const displayLeadEmail = (email) => {
  const value = displayValue(email);
  if (!value) return '';
  if (/@(leadcrm|growwcode)\.local$/i.test(value)) return '';
  return value;
};

export const getInstagramUrl = (instagramId) => {
  const value = displayValue(instagramId);
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const cleaned = value.replace(/^@/, '').trim();
  const username = cleaned.includes('instagram.com')
    ? cleaned.split('/').filter(Boolean).pop()
    : cleaned;
  if (!username) return '';
  return `https://instagram.com/${username}`;
};

export const companyNameToInstagramHandle = (companyName) => {
  const value = displayValue(companyName);
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9._]/g, '');
};

export const getLeadInstagramUrl = ({ instagramId, companyName } = {}) => {
  const fromId = getInstagramUrl(instagramId);
  if (fromId) return fromId;
  const handle = companyNameToInstagramHandle(companyName);
  return handle ? `https://instagram.com/${handle}` : '';
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
