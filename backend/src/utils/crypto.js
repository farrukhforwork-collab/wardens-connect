const bcrypt = require('bcryptjs');

const hashSensitive = async (value) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(value, salt);
};

const compareSensitive = async (value, hash) => {
  if (!hash) return false;
  return bcrypt.compare(value, hash);
};

module.exports = { hashSensitive, compareSensitive };
