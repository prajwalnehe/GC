const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const FollowUp = require('../models/FollowUp');
const User = require('../models/User');
const { getLeadScopeFilter, getFollowUpScopeFilter } = require('../utils/roles');

const getDashboardStats = async (req, res) => {
  try {
    const leadFilter = getLeadScopeFilter(req.user);
    const followUpFilter = getFollowUpScopeFilter(req.user);
    const isAdmin = req.user?.role === 'Admin';
    const isLeadManager = req.user?.role === 'Lead Manager';
    const personal = !isAdmin;

    const [
      totalLeads,
      pendingLeads,
      newLeads,
      interestedLeads,
      notInterestedLeads,
      contactedLeads,
      followUpLeads,
      proposalSent,
      wonLeads,
      lostLeads,
      revenueData,
    ] = await Promise.all([
      Lead.countDocuments(leadFilter),
      Lead.countDocuments({ ...leadFilter, status: { $nin: ['Interested', 'Not Interested'] } }),
      Lead.countDocuments({ ...leadFilter, status: 'New Lead' }),
      Lead.countDocuments({ ...leadFilter, status: 'Interested' }),
      Lead.countDocuments({ ...leadFilter, status: 'Not Interested' }),
      Lead.countDocuments({ ...leadFilter, status: 'Contacted' }),
      Lead.countDocuments({ ...leadFilter, status: 'Follow-up Required' }),
      Lead.countDocuments({ ...leadFilter, status: 'Proposal Sent' }),
      Lead.countDocuments({ ...leadFilter, status: 'Won' }),
      Lead.countDocuments({ ...leadFilter, status: 'Lost' }),
      Lead.aggregate([
        { $match: { ...leadFilter, status: 'Won' } },
        { $group: { _id: null, total: { $sum: '$revenue' } } },
      ]),
    ]);

    const revenue = revenueData[0]?.total || 0;
    const wonCount = wonLeads;
    const totalForConversion = totalLeads - lostLeads;
    const conversionRate = totalForConversion > 0 ? ((wonCount / totalForConversion) * 100).toFixed(1) : 0;

    res.json({
      totalLeads,
      newLeads,
      pendingLeads,
      interestedLeads,
      notInterestedLeads,
      followUpsTaken: interestedLeads + notInterestedLeads,
      contactedLeads,
      followUpLeads,
      proposalSent,
      wonLeads,
      lostLeads,
      revenue,
      conversionRate,
      personal,
      isLeadManager,
      totalClients: personal ? 0 : await Client.countDocuments(),
      pendingPayments: personal ? 0 : await Payment.countDocuments({ status: { $in: ['Pending', 'Partial Paid'] } }),
      upcomingFollowUps: await FollowUp.countDocuments({
        ...followUpFilter,
        reminderStatus: 'Pending',
        followUpDate: { $gte: new Date() },
      }),
      totalEmployees: isAdmin
        ? await User.countDocuments({ role: { $ne: 'Admin' }, isActive: true })
        : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMonthlyLeads = async (req, res) => {
  try {
    const leadFilter = getLeadScopeFilter(req.user);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const data = await Lead.aggregate([
      { $match: { ...leadFilter, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          won: { $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = data.map((d) => ({
      month: `${months[d._id.month - 1]} ${d._id.year}`,
      leads: d.count,
      won: d.won,
    }));

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLeadSourceDistribution = async (req, res) => {
  try {
    const leadFilter = getLeadScopeFilter(req.user);
    const data = await Lead.aggregate([
      { $match: leadFilter },
      { $group: { _id: '$leadSource', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(data.map((d) => ({ name: d._id, value: d.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversionRate = async (req, res) => {
  try {
    const leadFilter = getLeadScopeFilter(req.user);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const data = await Lead.aggregate([
      { $match: { ...leadFilter, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: 1 },
          won: { $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = data.map((d) => ({
      month: `${months[d._id.month - 1]}`,
      rate: d.total > 0 ? parseFloat(((d.won / d.total) * 100).toFixed(1)) : 0,
    }));

    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecentLeads = async (req, res) => {
  try {
    const leads = await Lead.find(getLeadScopeFilter(req.user))
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getMonthlyLeads,
  getLeadSourceDistribution,
  getConversionRate,
  getRecentLeads,
};
