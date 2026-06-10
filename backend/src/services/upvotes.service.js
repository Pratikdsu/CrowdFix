const prisma = require('../lib/prisma');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function addUpvote({ reportId, userId }) {
  // Check report exists
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw httpError('Report not found', 404);

  // Check already upvoted (@@unique constraint on [reportId, userId])
  const existing = await prisma.upvote.findUnique({
    where: { reportId_userId: { reportId, userId } },
  });
  if (existing) throw httpError('You have already upvoted this report', 409);

  // Create upvote + increment count in one transaction
  const [upvote] = await prisma.$transaction([
    prisma.upvote.create({ data: { reportId, userId } }),
    prisma.report.update({
      where: { id: reportId },
      data: { upvoteCount: { increment: 1 } },
    }),
  ]);

  return { upvoted: true, reportId };
}

async function removeUpvote({ reportId, userId }) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw httpError('Report not found', 404);

  const existing = await prisma.upvote.findUnique({
    where: { reportId_userId: { reportId, userId } },
  });
  if (!existing) throw httpError('You have not upvoted this report', 404);

  await prisma.$transaction([
    prisma.upvote.delete({
      where: { reportId_userId: { reportId, userId } },
    }),
    prisma.report.update({
      where: { id: reportId },
      data: { upvoteCount: { decrement: 1 } },
    }),
  ]);

  return { upvoted: false, reportId };
}

module.exports = { addUpvote, removeUpvote };