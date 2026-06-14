const Lead = require('../models/Lead');
const Notification = require('../models/Notification');
const Proposal = require('../models/Proposal');
const { Parser } = require('json2csv');
const { getLeadScopeFilter, canAccessLead, canCreateLead } = require('../utils/roles');
const { createClientFromLead } = require('../utils/clientFromLead');

const FOLLOWUP_LIST_STATUSES = ['Interested', 'Not Interested'];

const isMainLeadsList = (value) => value === 'true' || value === true || value === '1';

const enrichFollowUpBy = (lead) => {
  const doc = lead.toObject ? lead.toObject() : { ...lead };
  if (!doc.followUpBy && doc.activities?.length) {
    const activity = [...doc.activities].reverse().find(
      (a) => a.action === 'Status Changed'
        && (a.description?.includes('"Interested"') || a.description?.includes('"Not Interested"'))
    );
    if (activity?.performedBy) doc.followUpBy = activity.performedBy;
  }
  return doc;
};

const getLeads = async (req, res) => {
  try {
    const {
      search,
      status,
      excludeStatus,
      excludeStatuses,
      mainList,
      leadSource,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { ...getLeadScopeFilter(req.user) };
    if (search) {
      query.$or = [
        { leadName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      query.status = status;
      if (FOLLOWUP_LIST_STATUSES.includes(status)) {
        query.clientFollowupType = { $nin: ['IN', 'OUT'] };
      }
    } else if (isMainLeadsList(mainList)) {
      query.status = { $nin: FOLLOWUP_LIST_STATUSES };
    } else if (excludeStatuses) {
      query.status = { $nin: excludeStatuses.split(',').map((s) => s.trim()) };
    } else if (excludeStatus) {
      query.status = { $ne: excludeStatus };
    }
    if (leadSource) query.leadSource = leadSource;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const isFollowUpList = FOLLOWUP_LIST_STATUSES.includes(status);

    const leadQuery = Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('followUpBy', 'name role');

    if (isFollowUpList) {
      leadQuery.populate('activities.performedBy', 'name role');
    }

    const [leads, total] = await Promise.all([
      leadQuery.sort(sort).skip(skip).limit(parseInt(limit)),
      Lead.countDocuments(query),
    ]);

    const resultLeads = isFollowUpList ? leads.map(enrichFollowUpBy) : leads;

    res.json({
      leads: resultLeads,
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
    if (!canAccessLead(req.user, lead)) return res.status(403).json({ message: 'Not authorized to view this lead' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLead = async (req, res) => {
  try {
    if (!canCreateLead(req.user)) {
      return res.status(403).json({ message: 'Lead Manager cannot create leads' });
    }
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
    if (!canAccessLead(req.user, lead)) return res.status(403).json({ message: 'Not authorized to update this lead' });

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

      if (['Interested', 'Not Interested'].includes(req.body.status)) {
        lead.followUpBy = req.user._id;
        lead.followUpAt = new Date();
      }

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
    if (!canAccessLead(req.user, lead)) return res.status(403).json({ message: 'Not authorized to delete this lead' });
    await lead.deleteOne();
    res.json({ message: 'Lead removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markClientFollowup = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admin can mark client follow-up' });
    }

    const { type } = req.body;
    if (!['IN', 'OUT'].includes(type)) {
      return res.status(400).json({ message: 'Type must be IN or OUT' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    lead.clientFollowupType = type;
    lead.activities.push({
      action: 'IN/OUT Marked',
      description: `Marked as ${type}`,
      performedBy: req.user._id,
    });

    const existingProposal = await Proposal.findOne({ lead: lead._id, proposalType: type });
    if (!existingProposal) {
      await Proposal.create({
        lead: lead._id,
        title: `${lead.companyName} - ${type}`,
        amount: Number(lead.budget) || 0,
        proposalType: type,
        notes: `Added from Followup Leads (${type})`,
        status: 'Pending',
        createdBy: req.user._id,
      });
      lead.activities.push({
        action: 'Proposal Created',
        description: `Added to Proposals (${type})`,
        performedBy: req.user._id,
      });
    }

    await lead.save();
    const updated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('followUpBy', 'name role');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    if (!canAccessLead(req.user, lead)) return res.status(403).json({ message: 'Not authorized to add notes to this lead' });
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
    const leads = await Lead.find({
      ...getLeadScopeFilter(req.user),
      status: { $nin: FOLLOWUP_LIST_STATUSES },
    })
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
  getLeads, getLeadById, createLead, updateLead, deleteLead, markClientFollowup, addNote, exportLeads,
};
