const reportsService = require('../services/reports.service');

async function list(req, res, next) {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const result = await reportsService.list({
      status, category,
      page: Number(page),
      limit: Number(limit),
    });
    res.status(200).json(result);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const report = await reportsService.getById(req.params.id);
    res.status(200).json(report);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { title, description, category, latitude, longitude, address } = req.body;
    if (!title || !description || !category || !latitude || !longitude) {
      return res.status(400).json({
        error: 'title, description, category, latitude, and longitude are required',
      });
    }
    const report = await reportsService.create({
      reporterId: req.user.id,
      title, description, category,
      latitude: Number(latitude),
      longitude: Number(longitude),
      address,
    });
    res.status(201).json(report);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const report = await reportsService.update({
      reportId: req.params.id,
      userId: req.user.id,
      data: req.body,
    });
    res.status(200).json(report);
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update };