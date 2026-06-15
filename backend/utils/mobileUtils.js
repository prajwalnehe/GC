const Lead = require('../models/Lead');

const normalizeMobile = (mobile) => {
  const digits = (mobile || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
};

const findLeadByMobile = async (mobile, excludeLeadId = null) => {
  const normalizedMobile = normalizeMobile(mobile);
  if (!normalizedMobile) return null;

  const query = { normalizedMobile };
  if (excludeLeadId) query._id = { $ne: excludeLeadId };
  return Lead.findOne(query);
};

module.exports = { normalizeMobile, findLeadByMobile };
