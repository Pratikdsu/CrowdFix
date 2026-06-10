const prisma = require('../lib/prisma');

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function addComment({ reportId, userId, body }) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw httpError('Report not found', 404);

  if (!body || body.trim().length === 0) {
    throw httpError('Comment body cannot be empty', 400);
  }

  const comment = await prisma.comment.create({
    data: { reportId, userId, body: body.trim() },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return comment;
}

async function deleteComment({ commentId, userId, userRole }) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) throw httpError('Comment not found', 404);
  if (comment.isDeleted) throw httpError('Comment already deleted', 404);

  // FR-17: own comment, FR-18: admin can delete any
  const isOwner = comment.userId === userId;
  const isAdmin = userRole === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw httpError('You can only delete your own comments', 403);
  }

  // Soft delete — keeps the record but hides it from display
  await prisma.comment.update({
    where: { id: commentId },
    data: { isDeleted: true },
  });

  return { deleted: true, commentId };
}

module.exports = { addComment, deleteComment };
