const { verifyToken: verifyJwt } = require('../utils/jwt');

function verifyToken(req, res, next) {
	const authorization = req.headers.authorization || '';
	const [scheme, token] = authorization.split(' ');

	if (scheme !== 'Bearer' || !token) {
		return res.status(401).json({ error: 'Bearer token required' });
	}

	try {
		req.user = verifyJwt(token);
		return next();
	} catch (error) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}

module.exports = verifyToken;
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
