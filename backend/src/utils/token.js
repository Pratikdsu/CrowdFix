// backend/src/utils/token.js
const crypto = require('crypto');

// Random 64-char token for email verification links
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// 6-digit numeric OTP for password reset
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = { generateVerificationToken, generateOtp };