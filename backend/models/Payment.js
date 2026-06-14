const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    clientName: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    advancePaid: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Partial Paid', 'Paid'],
      default: 'Pending',
    },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

paymentSchema.pre('save', function (next) {
  this.remainingAmount = this.totalAmount - this.advancePaid;
  if (this.advancePaid >= this.totalAmount) {
    this.status = 'Paid';
  } else if (this.advancePaid > 0) {
    this.status = 'Partial Paid';
  } else {
    this.status = 'Pending';
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
