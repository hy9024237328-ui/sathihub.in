const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function generateAccessToken(user) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
}
function generateRefreshToken(user) {
  return jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
}
function verifyAccessToken(token) { return jwt.verify(token, JWT_SECRET); }
function verifyRefreshToken(token) { return jwt.verify(token, JWT_REFRESH_SECRET); }
function getRefreshTokenExpiry() { return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); }

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, getRefreshTokenExpiry };
