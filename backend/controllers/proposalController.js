const Proposal = require('../models/Proposal');
const Lead = require('../models/Lead');

const getProposals = async (req, res) => {
  try {
    const { status, leadId, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (leadId) query.lead = leadId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [proposals, total] = await Promise.all([
      Proposal.find(query)
        .populate('lead', 'leadName companyName email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Proposal.countDocuments(query),
    ]);

    res.json({ proposals, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('lead')
      .populate('createdBy', 'name');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProposal = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    if (req.file) {
      data.pdfFile = req.file.filename;
      data.pdfOriginalName = req.file.originalname;
    }
    const proposal = await Proposal.create(data);

    const lead = await Lead.findById(req.body.lead);
    if (lead) {
      lead.activities.push({
        action: 'Proposal Created',
        description: `Proposal "${proposal.title}" created`,
        performedBy: req.user._id,
      });
      if (proposal.status === 'Sent') lead.status = 'Proposal Sent';
      await lead.save();
    }

    const populated = await Proposal.findById(proposal._id)
      .populate('lead', 'leadName companyName')
      .populate('createdBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) proposal[key] = req.body[key];
    });
    if (req.file) {
      proposal.pdfFile = req.file.filename;
      proposal.pdfOriginalName = req.file.originalname;
    }
    await proposal.save();

    if (req.body.status === 'Sent') {
      const lead = await Lead.findById(proposal.lead);
      if (lead) {
        lead.status = 'Proposal Sent';
        await lead.save();
      }
    }

    const updated = await Proposal.findById(proposal._id)
      .populate('lead', 'leadName companyName')
      .populate('createdBy', 'name');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    await proposal.deleteOne();
    res.json({ message: 'Proposal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProposals, getProposalById, createProposal, updateProposal, deleteProposal };
