const authorityService = require('../services/authority.service');
const Papa = require('papaparse');
const PDFDocument = require('pdfkit');

// PATCH /api/reports/:id/status
async function updateStatus(req, res, next) {
  try {
    const { status, resolutionNote } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    const report = await authorityService.updateStatus({
      reportId: req.params.id,
      newStatus: status,
      userId: req.user.id,
      resolutionNote,
    });
    res.status(200).json(report);
  } catch (err) { next(err); }
}

// GET /api/authority/reports
async function listReports(req, res, next) {
  try {
    const { status, category, sortBy, order, page = 1, limit = 20 } = req.query;
    const result = await authorityService.listReports({
      authorityUserId: req.user.id,
      status, category, sortBy,
      order: order || 'desc',
      page: Number(page),
      limit: Number(limit),
    });
    res.status(200).json(result);
  } catch (err) { next(err); }
}

// POST /api/authority/assign
async function assignReport(req, res, next) {
  try {
    const { reportId } = req.body;
    if (!reportId) return res.status(400).json({ error: 'reportId is required' });

    const report = await authorityService.assignReport({
      reportId,
      authorityUserId: req.user.id,
    });
    res.status(200).json(report);
  } catch (err) { next(err); }
}

// GET /api/authority/export?format=csv|pdf
async function exportReports(req, res, next) {
  try {
    const format = req.query.format || 'csv';
    if (!['csv', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'format must be csv or pdf' });
    }

    const { rows } = await authorityService.exportReports({
      authorityUserId: req.user.id,
      format,
    });

    if (format === 'csv') {
      const csv = Papa.unparse(rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=crowdfix-reports.csv');
      return res.send(csv);
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=crowdfix-reports.pdf');
      doc.pipe(res);

      // Header
      doc.fontSize(18).fillColor('#DC143C').text('CrowdFix Nepal — Report Export', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#78716C').text(`Generated: ${new Date().toISOString()}`, { align: 'center' });
      doc.moveDown(1);

      // Table rows
      rows.forEach((row, i) => {
        if (doc.y > 700) doc.addPage(); // new page if near bottom

        doc.fontSize(11).fillColor('#1C1917').text(`${i + 1}. ${row.title}`, { underline: true });
        doc.fontSize(9).fillColor('#292524');
        doc.text(`Category: ${row.category} | Status: ${row.status} | Upvotes: ${row.upvotes}`);
        doc.text(`Reporter: ${row.reporter} | Address: ${row.address}`);
        doc.text(`Submitted: ${row.createdAt}`);
        if (row.resolutionNote) doc.text(`Resolution: ${row.resolutionNote}`);
        doc.moveDown(0.8);
      });

      doc.end();
    }
  } catch (err) { next(err); }
}

module.exports = { updateStatus, listReports, assignReport, exportReports };