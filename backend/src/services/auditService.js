const AuditLog = require('../models/AuditLog');

const recordAudit = async ({ actor, action, target, metadata }) => {
  await AuditLog.create({ actor, action, target, metadata });
};

module.exports = { recordAudit };
