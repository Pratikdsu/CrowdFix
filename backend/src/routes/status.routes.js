const express = require('express');
const ctrl = require('../controllers/authority.controller');
const requireAuth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

const router = express.Router({ mergeParams: true });

// PATCH /api/reports/:id/status — authority/admin only
router.patch('/', requireAuth, requireRole('AUTHORITY', 'ADMIN'), ctrl.updateStatus);

module.exports = router;
