// backend/src/utils/email.js
const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

// Build a real SMTP transporter only if credentials exist
if (config.smtp.user && config.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: Number(config.smtp.port) || 587,
    secure: false,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
}

async function sendEmail({ to, subject, text }) {
  if (!transporter) {
    // DEV FALLBACK — no SMTP configured, so print the email to the console
    console.log('\n📧 ───────── EMAIL (dev console) ─────────');
    console.log(`   To:      ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   ${text}`);
    console.log('─────────────────────────────────────────\n');
    return;
  }
  await transporter.sendMail({ from: config.smtp.from, to, subject, text });
}

module.exports = { sendEmail };