const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    followUpDate: { type: Date, required: true },
    followUpTime: { type: String, required: true },
    notes: { type: String, default: '' },
    reminder: { type: Boolean, default: true },
    reminderStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Missed'],
      default: 'Pending',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    clientType: { type: String, enum: ['IN', 'OUT'], default: 'IN' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FollowUp', followUpSchema);
