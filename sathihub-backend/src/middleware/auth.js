const { verifyAccessToken } = require('../utils/jwt');
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ success: false, error_code: 'NO_TOKEN', message: 'Token missing' });
  try {
    req.user = verifyAccessToken(authHeader.split(' ')[1]);
    next();
  } catch {
    return res.status(401).json({ success: false, error_code: 'INVALID_TOKEN', message: 'Token invalid or expired' });
  }
}
module.exports = { authenticate };
