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
    normalizedMobile: { type: String },
    email: { type: String, required: true, lowercase: true },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    businessType: {
      type: String,
      enum: [
        'E-commerce', 'Healthcare', 'Education', 'Real Estate', 'Finance & Banking',
        'Manufacturing', 'Retail', 'Hospitality', 'IT & Software', 'Marketing & Agency',
        'Logistics', 'Startup', 'Other',
      ],
      default: 'Other',
    },
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
        'Pending',
        'New Lead',
        'Contacted',
        'Interested',
        'Not Interested',
        'Follow-up Required',
        'Meeting Scheduled',
        'Proposal Sent',
        'Negotiation',
        'Won',
        'Lost',
        'On Hold',
      ],
      default: 'Pending',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    followUpBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    followUpAt: { type: Date },
    clientFollowupType: { type: String, enum: ['IN', 'OUT'] },
    revenue: { type: Number, default: 0 },
    activities: [activitySchema],
    notesHistory: [noteSchema],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    convertedToClient: { type: Boolean, default: false },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  },
  { timestamps: true }
);

leadSchema.pre('save', function setNormalizedMobile(next) {
  if (this.mobileNumber) {
    const digits = (this.mobileNumber || '').replace(/\D/g, '');
    let normalized = digits;
    if (digits.length === 11 && digits.startsWith('0')) normalized = digits.slice(1);
    else if (digits.length > 10) normalized = digits.slice(-10);
    this.normalizedMobile = normalized || undefined;
  }
  next();
});

leadSchema.index({ normalizedMobile: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Lead', leadSchema);
