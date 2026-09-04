const { verifyToken } = require('../utils/jwt');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      error: 'No token'
    });
  }

  try {
    const token = header.replace('Bearer ', '');

    req.user = verifyToken(token);

    next();
  } catch {
    res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
};