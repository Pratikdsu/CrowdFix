const upvotesService = require('../services/upvotes.service');
const commentsService = require('../services/comments.service');

// POST /api/reports/:id/upvote
async function upvote(req, res, next) {
  try {
    const result = await upvotesService.addUpvote({
      reportId: req.params.id,
      userId: req.user.id,
    });
    res.status(201).json(result);
  } catch (err) { next(err); }
}

// DELETE /api/reports/:id/upvote
async function removeUpvote(req, res, next) {
  try {
    const result = await upvotesService.removeUpvote({
      reportId: req.params.id,
      userId: req.user.id,
    });
    res.status(200).json(result);
  } catch (err) { next(err); }
}

// POST /api/reports/:id/comments
async function addComment(req, res, next) {
  try {
    const comment = await commentsService.addComment({
      reportId: req.params.id,
      userId: req.user.id,
      body: req.body.body,
    });
    res.status(201).json(comment);
  } catch (err) { next(err); }
}

// DELETE /api/comments/:id
async function deleteComment(req, res, next) {
  try {
    const result = await commentsService.deleteComment({
      commentId: req.params.id,
      userId: req.user.id,
      userRole: req.user.role,
    });
    res.status(200).json(result);
  } catch (err) { next(err); }
}

module.exports = { upvote, removeUpvote, addComment, deleteComment };