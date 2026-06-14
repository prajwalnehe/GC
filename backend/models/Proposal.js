const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    proposalDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['Pending', 'Draft', 'Sent', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    pdfFile: { type: String, default: '' },
    pdfOriginalName: { type: String, default: '' },
    notes: { type: String, default: '' },
    proposalType: { type: String, enum: ['IN', 'OUT'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

proposalSchema.pre('save', function (next) {
  if (this.status === 'Draft') this.status = 'Pending';
  next();
});

module.exports = mongoose.model('Proposal', proposalSchema);
