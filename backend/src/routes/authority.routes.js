const express = require('express');
const ctrl = require('../controllers/authority.controller');
const requireAuth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

const router = express.Router();

// All routes require login + AUTHORITY or ADMIN role
router.use(requireAuth);
router.use(requireRole('AUTHORITY', 'ADMIN'));

router.get('/reports', ctrl.listReports);
router.post('/assign', ctrl.assignReport);
router.get('/export', ctrl.exportReports);

module.exports = router;