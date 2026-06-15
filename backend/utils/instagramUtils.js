const deriveInstagramIdFromCompany = (companyName) => {
  const value = (companyName || '').trim();
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9._]/g, '');
};

module.exports = { deriveInstagramIdFromCompany };
