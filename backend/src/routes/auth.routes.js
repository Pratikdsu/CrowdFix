// backend/src/routes/auth.routes.js
const express = require('express');
const ctrl = require('../controllers/auth.controller');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', ctrl.register);
router.get('/verify', ctrl.verify);
router.post('/login', ctrl.login);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

// Protected route — proves the JWT middleware works
router.get('/me', requireAuth, ctrl.me);

module.exports = router;