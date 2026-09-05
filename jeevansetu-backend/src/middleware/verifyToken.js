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
