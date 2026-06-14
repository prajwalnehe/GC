const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    companyName: { type: String, required: true },
    contactDetails: {
      email: String,
      phone: String,
      address: String,
      city: String,
    },
    projectDetails: { type: String, default: '' },
    contractDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
