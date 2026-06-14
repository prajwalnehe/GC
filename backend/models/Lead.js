const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const leadSchema = new mongoose.Schema(
  {
    leadName: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    leadSource: {
      type: String,
      enum: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Social Media', 'Other'],
      default: 'Website',
    },
    requirementType: {
      type: String,
      enum: ['Web Development', 'Mobile App', 'UI/UX Design', 'Cloud Services', 'DevOps', 'Consulting', 'Other'],
      default: 'Web Development',
    },
    budget: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: [
        'New Lead',
        'Contacted',
        'Follow-up Required',
        'Meeting Scheduled',
        'Proposal Sent',
        'Negotiation',
        'Won',
        'Lost',
        'On Hold',
      ],
      default: 'New Lead',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    revenue: { type: Number, default: 0 },
    activities: [activitySchema],
    notesHistory: [noteSchema],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    convertedToClient: { type: Boolean, default: false },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
