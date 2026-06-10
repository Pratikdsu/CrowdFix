// backend/src/utils/jwt.js
const jwt = require('jsonwebtoken');
const config = require('../config/env');

function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret); // throws if invalid/expired
}

module.exports = { signToken, verifyToken };