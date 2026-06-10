// backend/src/__tests__/auth.test.js
const request = require('supertest');

// Mock prisma before app is loaded
jest.mock('../lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  $disconnect: jest.fn(),
}));

const app = require('../app');
const prisma = require('../lib/prisma');

const testUser = {
  name: 'Test User',
  email: 'testuser@crowdfix.test',
  password: 'Test@1234',
  role: 'CITIZEN',
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth — Register', () => {
  it('POST /api/auth/register → 201 with user object', async () => {
    prisma.user.findUnique.mockResolvedValue(null); // no existing user
    prisma.user.create.mockResolvedValue({
      id: 'cuid_001',
      email: testUser.email,
      name: testUser.name,
      role: 'CITIZEN',
      emailVerified: false,
    });

    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
  });

  it('POST /api/auth/register → 409 on duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing', email: testUser.email });

    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/auth/register → 400 on missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad@crowdfix.test' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Auth — Login', () => {
  it('POST /api/auth/login → 200 with token', async () => {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(testUser.password, 10);

    prisma.user.findUnique.mockResolvedValue({
      id: 'cuid_001',
      email: testUser.email,
      passwordHash: hash,
      role: 'CITIZEN',
      isActive: true,
      emailVerified: true,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/login → 401 on wrong password', async () => {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(testUser.password, 10);

    prisma.user.findUnique.mockResolvedValue({
      id: 'cuid_001',
      email: testUser.email,
      passwordHash: hash,
      role: 'CITIZEN',
      isActive: true,
      emailVerified: true,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!',
    });
    expect(res.statusCode).toBe(401);
  });
});

describe('Auth — Me (protected)', () => {
  it('GET /api/auth/me → 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});