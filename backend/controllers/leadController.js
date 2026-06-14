const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Notification = require('../models/Notification');
const { Parser } = require('json2csv');

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
    projectDetails: lead.requirementType + ' - ' + (lead.notes || 'No additional details'),
    leadId: lead._id,
    createdBy: userId,
  });

  lead.convertedToClient = true;
  lead.clientId = client._id;
  await lead.save();
  return client;
};

const getLeads = async (req, res) => {
  try {
    const {
      search,
      status,
      excludeStatus,
      leadSource,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { leadName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (excludeStatus) query.status = { $ne: excludeStatus };
    if (leadSource) query.leadSource = leadSource;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Lead.countDocuments(query),
    ]);

    res.json({
      leads,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('documents')
      .populate('activities.performedBy', 'name')
      .populate('notesHistory.createdBy', 'name');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLead = async (req, res) => {
  try {
    const leadData = { ...req.body, createdBy: req.user._id };
    if (!leadData.assignedTo) leadData.assignedTo = req.user._id;

    const lead = await Lead.create(leadData);

    lead.activities.push({
      action: 'Lead Created',
      description: `Lead "${lead.leadName}" was created`,
      performedBy: req.user._id,
    });
    await lead.save();

    if (lead.assignedTo && lead.assignedTo.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: lead.assignedTo,
        title: 'New Lead Assigned',
        message: `You have been assigned lead: ${lead.leadName}`,
        type: 'lead_assigned',
        link: `/leads/${lead._id}`,
        relatedId: lead._id,
      });
    }

    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const oldStatus = lead.status;
    const oldAssigned = lead.assignedTo?.toString();

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) lead[key] = req.body[key];
    });

    if (req.body.status && req.body.status !== oldStatus) {
      lead.activities.push({
        action: 'Status Changed',
        description: `Status changed from "${oldStatus}" to "${req.body.status}"`,
        performedBy: req.user._id,
      });

      if (req.body.status === 'Won' && !lead.convertedToClient) {
        await createClientFromLead(lead, req.user._id);
        lead.activities.push({
          action: 'Client Created',
          description: 'Lead converted to client automatically',
          performedBy: req.user._id,
        });
      }
    }

    if (req.body.assignedTo && req.body.assignedTo !== oldAssigned) {
      await Notification.create({
        user: req.body.assignedTo,
        title: 'Lead Assigned',
        message: `You have been assigned lead: ${lead.leadName}`,
        type: 'lead_assigned',
        link: `/leads/${lead._id}`,
        relatedId: lead._id,
      });
    }

    await lead.save();
    const updated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    await lead.deleteOne();
    res.json({ message: 'Lead removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    lead.notesHistory.push({ content: req.body.content, createdBy: req.user._id });
    lead.activities.push({
      action: 'Note Added',
      description: req.body.content.substring(0, 100),
      performedBy: req.user._id,
    });
    await lead.save();
    const updated = await Lead.findById(lead._id).populate('notesHistory.createdBy', 'name');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    const fields = [
      'leadName', 'companyName', 'contactPerson', 'mobileNumber', 'email',
      'city', 'state', 'businessType', 'leadSource', 'requirementType', 'budget', 'status', 'createdAt',
    ];
    const data = leads.map((l) => ({
      leadName: l.leadName,
      companyName: l.companyName,
      contactPerson: l.contactPerson,
      mobileNumber: l.mobileNumber,
      email: l.email,
      city: l.city,
      state: l.state,
      businessType: l.businessType,
      leadSource: l.leadSource,
      requirementType: l.requirementType,
      budget: l.budget,
      status: l.status,
      createdAt: l.createdAt,
      assignedTo: l.assignedTo?.name || '',
    }));

    const parser = new Parser({ fields: [...fields, 'assignedTo'] });
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('leads-export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLeads, getLeadById, createLead, updateLead, deleteLead, addNote, exportLeads,
};
