const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

const getPayments = async (req, res) => {
  try {
    const { status, clientId, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (clientId) query.client = clientId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('client', 'clientName companyName')
        .populate('project', 'projectName')
        .populate('createdBy', 'name')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments(query),
    ]);
    res.json({ payments, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('client')
      .populate('project')
      .populate('createdBy', 'name');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create({ ...req.body, createdBy: req.user._id });

    const dueDate = new Date(req.body.dueDate);
    const now = new Date();
    if (dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
      await Notification.create({
        user: req.user._id,
        title: 'Payment Due',
        message: `Payment of ₹${req.body.totalAmount} due for ${req.body.clientName}`,
        type: 'payment_due',
        link: '/payments',
        relatedId: payment._id,
      });
    }

    const populated = await Payment.findById(payment._id)
      .populate('client', 'clientName companyName')
      .populate('project', 'projectName');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) payment[key] = req.body[key];
    });
    await payment.save();
    const updated = await Payment.findById(payment._id)
      .populate('client', 'clientName companyName')
      .populate('project', 'projectName');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    await payment.deleteOne();
    res.json({ message: 'Payment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPayments, getPaymentById, createPayment, updatePayment, deletePayment };
