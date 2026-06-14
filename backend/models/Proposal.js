const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    proposalDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Approved', 'Rejected'],
      default: 'Draft',
    },
    pdfFile: { type: String, default: '' },
    pdfOriginalName: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Proposal', proposalSchema);
