// backend/src/controllers/auth.controller.js
const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    const user = await authService.register({ name, email, password });
    res.status(201).json({ message: 'Registered. Check your email to verify your account.', user });
  } catch (err) { next(err); }
}

async function verify(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Verification token is required' });
    await authService.verifyEmail(token);
    res.status(200).json({ message: 'Email verified. You can now log in.' });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (err) { next(err); }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });
    await authService.forgotPassword(email);
    res.status(200).json({ message: 'If that email exists, a reset code has been sent.' });
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'email, otp, and newPassword are required' });
    }
    await authService.resetPassword({ email, otp, newPassword });
    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) { next(err); }
}

// Protected — returns the currently logged-in user
async function me(req, res) {
  res.status(200).json({ user: req.user });
}

module.exports = { register, verify, login, forgotPassword, resetPassword, me };