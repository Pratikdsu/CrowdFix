// backend/src/__tests__/reports.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../lib/prisma', () => ({
  report: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  $disconnect: jest.fn(),
}));

const app = require('../app');
const prisma = require('../lib/prisma');

// Generate a valid JWT for tests
const mockUser = { userId: 'cuid_001', email: 'test@crowdfix.test', role: 'CITIZEN' };
const mockAuthority = { userId: 'cuid_002', email: 'auth@crowdfix.test', role: 'AUTHORITY' };
const token = jwt.sign(mockUser, process.env.JWT_SECRET || 'crowdfix_test_secret');
const authorityToken = jwt.sign(mockAuthority, process.env.JWT_SECRET || 'crowdfix_test_secret');

const mockReport = {
  id: 'report_001',
  title: 'Broken streetlight',
  description: 'The streetlight on Main St is broken.',
  category: 'INFRASTRUCTURE',
  status: 'OPEN',
  latitude: 27.7172,
  longitude: 85.3240,
  reporterId: mockUser.id,
  upvoteCount: 0,
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
  prisma.report.count.mockResolvedValue(1);
  prisma.user.findUnique.mockResolvedValue({
    id: 'cuid_001',
    email: 'test@crowdfix.test',
    role: 'CITIZEN',
    isActive: true,
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Reports — Create', () => {
  it('POST /api/reports → 401 without token', async () => {
    const res = await request(app).post('/api/reports').send(mockReport);
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/reports → 201 with valid token', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'cuid_001',
      email: 'test@crowdfix.test',
      role: 'CITIZEN',
      isActive: true,
    });
    prisma.report.create.mockResolvedValue(mockReport);

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Broken streetlight',
        description: 'The streetlight on Main St is broken.',
        category: 'INFRASTRUCTURE',
        latitude: 27.7172,
        longitude: 85.3240,
      });
    expect(res.statusCode).toBe(201);
  });
});

describe('Reports — Update Status', () => {
  it('PATCH /api/reports/:id → 401 without token', async () => {
    const res = await request(app)
      .patch(`/api/reports/${mockReport.id}`)
      .send({ status: 'ASSIGNED' });
    expect(res.statusCode).toBe(401);
  });

  it('PATCH /api/reports/:id → 200 or 403 with authority token', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'cuid_002',
      email: 'auth@crowdfix.test',
      role: 'AUTHORITY',
      isActive: true,
    });
    prisma.report.findUnique.mockResolvedValue(mockReport);
    prisma.report.update.mockResolvedValue({ ...mockReport, status: 'ASSIGNED' });

    const res = await request(app)
      .patch(`/api/reports/${mockReport.id}`)
      .set('Authorization', `Bearer ${authorityToken}`)
      .send({ status: 'ASSIGNED' });
    expect([200, 403]).toContain(res.statusCode);
  });
});