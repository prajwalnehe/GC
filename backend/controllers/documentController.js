const Document = require('../models/Document');
const Lead = require('../models/Lead');
const Client = require('../models/Client');

const getDocuments = async (req, res) => {
  try {
    const { leadId, clientId, projectId, type } = req.query;
    const query = {};
    if (leadId) query.lead = leadId;
    if (clientId) query.client = clientId;
    if (projectId) query.project = projectId;
    if (type) query.type = type;

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const doc = await Document.create({
      name: req.body.name || req.file.originalname,
      type: req.body.type || 'Other',
      filePath: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      lead: req.body.lead || undefined,
      client: req.body.client || undefined,
      project: req.body.project || undefined,
      uploadedBy: req.user._id,
    });

    if (req.body.lead) {
      await Lead.findByIdAndUpdate(req.body.lead, { $push: { documents: doc._id } });
    }
    if (req.body.client) {
      await Client.findByIdAndUpdate(req.body.client, { $push: { contractDocuments: doc._id } });
    }

    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    await doc.deleteOne();
    res.json({ message: 'Document removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDocuments, uploadDocument, deleteDocument };
