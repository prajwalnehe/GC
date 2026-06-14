const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');
const Notification = require('../models/Notification');

const getFollowUps = async (req, res) => {
  try {
    const { status, reminderStatus, leadId, clientType = 'IN', page = 1, limit = 10 } = req.query;
    const query = { clientType };
    if (status) query.status = status;
    if (reminderStatus) query.reminderStatus = reminderStatus;
    if (leadId) query.lead = leadId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [followUps, total] = await Promise.all([
      FollowUp.find(query)
        .populate('lead', 'leadName companyName email status')
        .populate('createdBy', 'name')
        .populate('assignedTo', 'name')
        .sort({ followUpDate: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      FollowUp.countDocuments(query),
    ]);

    res.json({ followUps, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFollowUpById = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id)
      .populate('lead')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name');
    if (!followUp) return res.status(404).json({ message: 'Follow-up not found' });
    res.json(followUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.create({
      ...req.body,
      createdBy: req.user._id,
      assignedTo: req.body.assignedTo || req.user._id,
    });

    const lead = await Lead.findById(req.body.lead);
    if (lead) {
      lead.activities.push({
        action: 'Follow-up Scheduled',
        description: `Follow-up scheduled for ${req.body.followUpDate}`,
        performedBy: req.user._id,
      });
      if (lead.status === 'New Lead') lead.status = 'Follow-up Required';
      await lead.save();
    }

    if (followUp.reminder) {
      await Notification.create({
        user: followUp.assignedTo,
        title: 'Follow-up Reminder',
        message: `Follow-up scheduled for ${lead?.leadName || 'lead'} on ${req.body.followUpDate}`,
        type: 'follow_up',
        link: `/follow-ups`,
        relatedId: followUp._id,
      });
    }

    const populated = await FollowUp.findById(followUp._id)
      .populate('lead', 'leadName companyName')
      .populate('assignedTo', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) return res.status(404).json({ message: 'Follow-up not found' });

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) followUp[key] = req.body[key];
    });
    await followUp.save();

    const updated = await FollowUp.findById(followUp._id)
      .populate('lead', 'leadName companyName')
      .populate('assignedTo', 'name');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) return res.status(404).json({ message: 'Follow-up not found' });
    await followUp.deleteOne();
    res.json({ message: 'Follow-up removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFollowUps, getFollowUpById, createFollowUp, updateFollowUp, deleteFollowUp };
