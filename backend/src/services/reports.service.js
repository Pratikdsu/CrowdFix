const prisma = require('../lib/prisma');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function list({ status, category, page, limit }) {
  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, avatarUrl: true } },
        media: true,
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return {
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getById(id) {
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      reporter: { select: { id: true, name: true, avatarUrl: true } },
      authority: { select: { id: true, jurisdiction: true, officerTitle: true } },
      media: true,
      comments: {
        where: { isDeleted: false },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
      upvotes: { select: { userId: true } },
    },
  });

  if (!report) throw httpError('Report not found', 404);
  return report;
}

async function create(data) {
  const report = await prisma.report.create({
    data,
    include: {
      reporter: { select: { id: true, name: true } },
    },
  });
  return report;
}

async function update({ reportId, userId, data }) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw httpError('Report not found', 404);
  if (report.reporterId !== userId) throw httpError('You can only edit your own reports', 403);

  // FR-13: 30-minute edit window
  const thirtyMin = 30 * 60 * 1000;
  if (Date.now() - new Date(report.createdAt).getTime() > thirtyMin) {
    throw httpError('Edit window expired — reports can only be edited within 30 minutes', 403);
  }

  const allowedFields = ['title', 'description', 'category', 'latitude', 'longitude', 'address'];
  const updateData = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: updateData,
    include: { reporter: { select: { id: true, name: true } } },
  });
  return updated;
}

module.exports = { list, getById, create, update };