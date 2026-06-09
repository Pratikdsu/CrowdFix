const express = require('express');
const ctrl = require('../controllers/reports.controller');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', ctrl.list);               // Public — list/filter reports
router.get('/:id', ctrl.getById);         // Public — single report with comments
router.post('/', requireAuth, ctrl.create); // Auth — submit a new report
router.patch('/:id', requireAuth, ctrl.update); // Auth — edit own report (30-min window)

module.exports = router;