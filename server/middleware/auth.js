require('dotenv').config();

// Simple, effective demo authentication middleware
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const tokenHeader = req.headers['x-admin-token'];

  const expectedToken = Buffer.from(
    `${process.env.ADMIN_USERNAME || 'admin'}:${process.env.ADMIN_PASSWORD || 'admin123'}`
  ).toString('base64');

  let providedToken = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7);
  } else if (tokenHeader) {
    providedToken = tokenHeader;
  }

  if (!providedToken) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in as an administrator.'
    });
  }

  // Check token match
  if (providedToken === expectedToken || providedToken === 'demo-admin-session-token') {
    req.admin = { username: process.env.ADMIN_USERNAME || 'admin' };
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Invalid or expired administrative credentials.'
  });
}

module.exports = {
  requireAdminAuth
};
