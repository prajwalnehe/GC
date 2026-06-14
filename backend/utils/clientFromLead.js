const Client = require('../models/Client');

const createClientFromLead = async (lead, userId) => {
  const existing = await Client.findOne({ leadId: lead._id });
  if (existing) return existing;

  const client = await Client.create({
    clientName: lead.contactPerson,
    companyName: lead.companyName,
    contactDetails: {
      email: lead.email,
      phone: lead.mobileNumber,
      city: lead.city,
      state: lead.state,
    },
    projectDetails: `${lead.requirementType} - ${lead.notes || 'No additional details'}`,
    leadId: lead._id,
    createdBy: userId,
  });

  lead.convertedToClient = true;
  lead.clientId = client._id;
  await lead.save();
  return client;
};

module.exports = { createClientFromLead };
