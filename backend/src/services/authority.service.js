const prisma = require('../lib/prisma');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// Valid status transitions (state machine — FR-19)
const validTransitions = {
  OPEN: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

async function updateStatus({ reportId, newStatus, userId, resolutionNote }) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw httpError('Report not found', 404);

  // Check valid transition
  const allowed = validTransitions[report.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw httpError(
      `Cannot transition from ${report.status} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
      400
    );
  }

  const updateData = { status: newStatus };

  // If resolving, save the resolution note and timestamp (FR-21)
  if (newStatus === 'RESOLVED') {
    updateData.resolvedAt = new Date();
    if (resolutionNote) updateData.resolutionNote = resolutionNote;
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: updateData,
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      authority: { select: { id: true, jurisdiction: true } },
    },
  });

  return updated;
}

async function listReports({ authorityUserId, status, category, sortBy, order, page, limit }) {
  // Get the authority profile for this user
  const authority = await prisma.authority.findUnique({
    where: { userId: authorityUserId },
  });
  if (!authority) throw httpError('Authority profile not found', 404);

  const where = {};

  // Filter by assigned authority OR unassigned reports in their jurisdiction
  // For simplicity: show all reports assigned to this authority + all OPEN reports
  where.OR = [
    { authorityId: authority.id },
    { status: 'OPEN' },
  ];

  if (status) where.status = status;
  if (category) where.category = category;

  // Build orderBy
  const orderByMap = {
    date: { createdAt: order || 'desc' },
    upvotes: { upvoteCount: order || 'desc' },
    status: { status: order || 'asc' },
    category: { category: order || 'asc' },
  };
  const orderBy = orderByMap[sortBy] || { createdAt: 'desc' };

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        authority: { select: { id: true, jurisdiction: true } },
        media: true,
        _count: { select: { comments: true, upvotes: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return {
    reports,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function assignReport({ reportId, authorityUserId }) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw httpError('Report not found', 404);

  const authority = await prisma.authority.findUnique({
    where: { userId: authorityUserId },
  });
  if (!authority) throw httpError('Authority profile not found', 404);

  if (report.status !== 'OPEN') {
    throw httpError('Only OPEN reports can be assigned', 400);
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      authorityId: authority.id,
      status: 'ASSIGNED',
    },
    include: {
      reporter: { select: { id: true, name: true } },
      authority: { select: { id: true, jurisdiction: true, officerTitle: true } },
    },
  });

  return updated;
}

async function exportReports({ authorityUserId, format }) {
  const authority = await prisma.authority.findUnique({
    where: { userId: authorityUserId },
  });
  if (!authority) throw httpError('Authority profile not found', 404);

  const reports = await prisma.report.findMany({
    where: {
      OR: [
        { authorityId: authority.id },
        { status: 'OPEN' },
      ],
    },
    include: {
      reporter: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Flatten data for export
  const rows = reports.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    status: r.status,
    reporter: r.reporter?.name || '',
    reporterEmail: r.reporter?.email || '',
    address: r.address || '',
    latitude: Number(r.latitude),
    longitude: Number(r.longitude),
    upvotes: r.upvoteCount,
    createdAt: r.createdAt.toISOString(),
    resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : '',
    resolutionNote: r.resolutionNote || '',
  }));

  return { rows, format };
}

module.exports = { updateStatus, listReports, assignReport, exportReports };