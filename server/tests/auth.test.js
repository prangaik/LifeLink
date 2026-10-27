import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import User from '../src/models/User.js';

setupTestDB();

describe('Auth Workflow & Access Control Tests', () => {
  const testUser = {
    name: 'Test Donor',
    email: 'test.donor@example.com',
    password: 'Password@123',
    phone: '+91 99999 88888',
    bloodGroup: 'O+',
    city: 'Pune',
    latitude: 18.5204,
    longitude: 73.8567,
  };

  test('POST /api/auth/register creates a new user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.role).toBe('donor'); // default role
    expect(res.body.user.password).toBeUndefined(); // never expose password
  });

  test('POST /api/auth/register prevents duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('POST /api/auth/register prevents client self-assigning reviewer or admin role', async () => {
    const privilegedAttempt = {
      ...testUser,
      email: 'hacker@example.com',
      role: 'admin',
    };

    const res = await request(app).post('/api/auth/register').send(privilegedAttempt);
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('donor'); // role override prevented
  });

  test('POST /api/auth/login succeeds with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('POST /api/auth/login rejects incorrect password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('GET /api/auth/me rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me allows authenticated requests with valid Bearer token', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const token = regRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('POST /api/auth/register allows a requester to register without donor blood group', async () => {
    const requesterUser = {
      name: 'Priya Requester',
      email: 'priya.requester@example.com',
      password: 'Password@123',
      phone: '+91 98330 11223',
      city: 'Pune',
      role: 'requester',
      // No bloodGroup provided
    };

    const res = await request(app).post('/api/auth/register').send(requesterUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('requester');
    expect(res.body.user.bloodGroup).toBe('Not Specified');
  });

  test('POST /api/auth/register rejects donor registration if bloodGroup is missing', async () => {
    const incompleteDonor = {
      name: 'Incomplete Donor',
      email: 'incomplete@example.com',
      password: 'Password@123',
      phone: '+91 98330 44556',
      city: 'Pune',
      role: 'donor',
      // Missing bloodGroup
    };

    const res = await request(app).post('/api/auth/register').send(incompleteDonor);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
