// backend/src/__tests__/upvotesComments.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../lib/prisma', () => ({
  user: { findUnique: jest.fn() },
  report: { findUnique: jest.fn(), update: jest.fn() },
  upvote: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
  comment: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  $transaction: jest.fn((ops) => Promise.all(ops)),
  $disconnect: jest.fn(),
}));

const app = require('../app');
const prisma = require('../lib/prisma');

const mockUser = { id: 'cuid_001', email: 'test@crowdfix.test', role: 'CITIZEN', isActive: true };
const token = jwt.sign(
  { userId: mockUser.id, role: mockUser.role },
  process.env.JWT_SECRET || 'crowdfix_test_secret'
);

const reportId = 'report_001';
const commentId = 'comment_001';

beforeEach(() => {
  jest.clearAllMocks();
  prisma.user.findUnique.mockResolvedValue(mockUser);
  prisma.report.findUnique.mockResolvedValue({
    id: reportId,
    reporterId: mockUser.id,
    status: 'OPEN',
    upvoteCount: 0,
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Upvotes', () => {
  it('POST /api/reports/:id/upvote → 401 without token', async () => {
    const res = await request(app).post(`/api/reports/${reportId}/upvote`);
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/reports/:id/upvote → 201 when not yet upvoted', async () => {
    prisma.upvote.findUnique.mockResolvedValue(null);
    prisma.upvote.create.mockResolvedValue({ id: 'upvote_001', reportId, userId: mockUser.id });
    prisma.report.update.mockResolvedValue({ id: reportId, upvoteCount: 1 });

    const res = await request(app)
      .post(`/api/reports/${reportId}/upvote`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 201]).toContain(res.statusCode);
  });

  it('POST /api/reports/:id/upvote → 409 when already upvoted', async () => {
    prisma.upvote.findUnique.mockResolvedValue({ id: 'upvote_001', reportId, userId: mockUser.id });

    const res = await request(app)
      .post(`/api/reports/${reportId}/upvote`)
      .set('Authorization', `Bearer ${token}`);
    expect([409, 400]).toContain(res.statusCode);
  });

  it('DELETE /api/reports/:id/upvote → 200 when upvote exists', async () => {
    prisma.upvote.findUnique.mockResolvedValue({ id: 'upvote_001', reportId, userId: mockUser.id });
    prisma.upvote.delete.mockResolvedValue({});
    prisma.report.update.mockResolvedValue({ id: reportId, upvoteCount: 0 });

    const res = await request(app)
      .delete(`/api/reports/${reportId}/upvote`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 204]).toContain(res.statusCode);
  });
});

describe('Comments', () => {
  it('POST /api/reports/:id/comments → 401 without token', async () => {
    const res = await request(app)
      .post(`/api/reports/${reportId}/comments`)
      .send({ body: 'This is a comment.' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/reports/:id/comments → 201 with valid token', async () => {
    prisma.comment.create.mockResolvedValue({
      id: commentId,
      reportId,
      userId: mockUser.id,
      body: 'This is a comment.',
      isDeleted: false,
    });

    const res = await request(app)
      .post(`/api/reports/${reportId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'This is a comment.' });
    expect([200, 201]).toContain(res.statusCode);
  });

  it('DELETE /api/comments/:id → 401 without token', async () => {
    const res = await request(app).delete(`/api/comments/${commentId}`);
    expect(res.statusCode).toBe(401);
  });

  it('DELETE /api/comments/:id → 200 when owner deletes', async () => {
    prisma.comment.findUnique.mockResolvedValue({
      id: commentId,
      userId: mockUser.id,
      isDeleted: false,
    });
    prisma.comment.update.mockResolvedValue({ id: commentId, isDeleted: true });

    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 204]).toContain(res.statusCode);
  });
});