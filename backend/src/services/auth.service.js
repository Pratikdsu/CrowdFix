// backend/src/services/auth.service.js
const bcrypt = require('bcrypt'); // change to 'bcryptjs' if that's what you installed
const prisma = require('../lib/prisma');
const config = require('../config/env');
const { signToken } = require('../utils/jwt');
const { generateVerificationToken, generateOtp } = require('../utils/token');
const { sendEmail } = require('../utils/email');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function register({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw httpError('An account with this email already exists', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = generateVerificationToken();

  const user = await prisma.user.create({
    data: { name, email, passwordHash, verificationToken },
  });

  const verifyUrl = `http://localhost:${config.port}/api/auth/verify?token=${verificationToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify your CrowdFix account',
    text: `Welcome to CrowdFix! Click to verify your account:\n${verifyUrl}`,
  });

  return { id: user.id, email: user.email, name: user.name };
}

async function verifyEmail(token) {
  const user = await prisma.user.findFirst({ where: { verificationToken: token } });
  if (!user) throw httpError('Invalid or expired verification token', 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null },
  });
  return { email: user.email };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw httpError('Invalid email or password', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw httpError('Invalid email or password', 401);

  if (!user.emailVerified) throw httpError('Please verify your email before logging in', 403);
  if (!user.isActive) throw httpError('Your account has been deactivated', 403);

  const token = signToken({ userId: user.id, role: user.role });
  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Don't reveal whether the email exists — always behave the same
  if (!user) return;

  const otp = generateOtp();
  const resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await prisma.user.update({
    where: { id: user.id },
    data: { resetOtp: otp, resetOtpExpiry },
  });

  await sendEmail({
    to: email,
    subject: 'Your CrowdFix password reset code',
    text: `Your password reset code is: ${otp}\nIt expires in 10 minutes.`,
  });
}

async function resetPassword({ email, otp, newPassword }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.resetOtp !== otp) throw httpError('Invalid reset code', 400);
  if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
    throw httpError('Reset code has expired', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetOtp: null, resetOtpExpiry: null },
  });
}

module.exports = { register, verifyEmail, login, forgotPassword, resetPassword };