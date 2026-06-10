const express = require('express');
const ctrl = require('../controllers/upvotesComments.controller');
const requireAuth = require('../middleware/auth.middleware');

// Reports sub-routes (/api/reports/:id/upvote and /api/reports/:id/comments)
const reportRouter = express.Router({ mergeParams: true });

reportRouter.post('/upvote', requireAuth, ctrl.upvote);
reportRouter.delete('/upvote', requireAuth, ctrl.removeUpvote);
reportRouter.post('/comments', requireAuth, ctrl.addComment);

// Standalone comments route (/api/comments/:id)
const commentsRouter = express.Router();
commentsRouter.delete('/:id', requireAuth, ctrl.deleteComment);

module.exports = { reportRouter, commentsRouter };