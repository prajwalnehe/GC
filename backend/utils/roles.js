const canViewAllLeads = (user) => ['Admin', 'Lead Manager'].includes(user?.role);

const canCreateLead = (user) => ['Admin', 'Lead Manager', 'Sales Executive'].includes(user?.role);

const getLeadScopeFilter = (user) => (
  canViewAllLeads(user) ? {} : { assignedTo: user._id }
);

const getFollowUpScopeFilter = (user) => (
  canViewAllLeads(user) ? {} : { assignedTo: user._id }
);

const canAccessLead = (user, lead) => {
  if (!lead) return false;
  if (canViewAllLeads(user)) return true;
  return lead.assignedTo?.toString() === user._id.toString();
};

const canChangeLeadStatus = (user) => canViewAllLeads(user);

module.exports = { canViewAllLeads, canCreateLead, canChangeLeadStatus, getLeadScopeFilter, getFollowUpScopeFilter, canAccessLead };
