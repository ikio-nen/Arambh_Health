function requireRole(...allowedRoles) {
	return (req, res, next) => {
		if (!req.user || !allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ error: 'Insufficient permissions' });
		}

		return next();
	};
}

module.exports = requireRole;
module.exports = (...allowed) => (req, res, next) => {
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({
      error: 'Forbidden'
    });
  }

  next();
};
