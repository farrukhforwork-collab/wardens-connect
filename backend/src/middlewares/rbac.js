const rbac = (...roles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const allowed = roles.includes(req.user.role.name) || req.user.isSuperAdmin;
  if (!allowed) return res.status(403).json({ message: 'Insufficient role' });
  return next();
};

module.exports = rbac;
