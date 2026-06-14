const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['Proposal PDF', 'Agreement', 'Invoice', 'Requirement Documents', 'Payment Receipt', 'Other'],
      default: 'Other',
    },
    filePath: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
