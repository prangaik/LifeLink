import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import User from '../src/models/User.js';
import BloodRequest from '../src/models/BloodRequest.js';
import ReviewLog from '../src/models/ReviewLog.js';

setupTestDB();

describe('Reviewer/Admin Authorization & Audit Trail Tests', () => {
  let reviewerToken;
  let reviewerId;
  let normalUserToken;
  let sampleRequestId;

  beforeEach(async () => {
    // 1. Create Reviewer directly in DB (preventing client self-elevation)
    const reviewer = await User.create({
      name: 'Dr. Anita Joshi',
      email: 'dr.anita@example.com',
      password: 'Password@123',
      phone: '+91 98111 22233',
      role: 'reviewer',
      bloodGroup: 'O+',
      city: 'Pune',
      location: { type: 'Point', coordinates: [73.8567, 18.5204] },
    });
    reviewerId = reviewer._id;

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'dr.anita@example.com',
      password: 'Password@123',
    });
    reviewerToken = loginRes.body.token;

    // 2. Create Normal User
    const userRes = await request(app).post('/api/auth/register').send({
      name: 'Regular Donor',
      email: 'regular@example.com',
      password: 'Password@123',
      phone: '+91 98111 44455',
      bloodGroup: 'A+',
      city: 'Pune',
    });
    normalUserToken = userRes.body.token;

    // 3. Create a pending request
    const bloodRequest = await BloodRequest.create({
      requester: userRes.body.user._id,
      patientName: 'K. Patel',
      bloodGroup: 'A+',
      unitsRequired: 2,
      hospitalName: 'KEM Hospital Pune',
      city: 'Pune',
      location: { type: 'Point', coordinates: [73.8645, 18.5198] },
      urgency: 'high',
      contactPhone: '+91 98111 44455',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'unverified',
    });
    sampleRequestId = bloodRequest._id;
  });

  test('Ordinary user is forbidden (403) from accessing admin metrics and review endpoints', async () => {
    const metricsRes = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${normalUserToken}`);
    expect(metricsRes.status).toBe(403);

    const reviewRes = await request(app)
      .post(`/api/admin/requests/${sampleRequestId}/review`)
      .set('Authorization', `Bearer ${normalUserToken}`)
      .send({
        action: 'approved',
        decisionReason: 'Trying to approve without authorization',
      });
    expect(reviewRes.status).toBe(403);
  });

  test('Reviewer accesses metrics and submits verified decision with audit log', async () => {
    // 1. Get metrics
    const metricsRes = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(metricsRes.status).toBe(200);
    expect(metricsRes.body.metrics.totalRequests).toBeGreaterThanOrEqual(1);

    // 2. Submit approval review
    const reason = 'Hospital admission certificate verified via direct phone check with KEM ICU desk.';
    const reviewRes = await request(app)
      .post(`/api/admin/requests/${sampleRequestId}/review`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({
        action: 'approved',
        decisionReason: reason,
      });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.success).toBe(true);
    expect(reviewRes.body.request.status).toBe('verified');
    expect(reviewRes.body.request.reviewStatus).toBe('approved');

    // 3. Verify audit log record
    const auditLogs = await ReviewLog.find({ request: sampleRequestId });
    expect(auditLogs.length).toBe(1);
    expect(auditLogs[0].action).toBe('approved');
    expect(auditLogs[0].decisionReason).toBe(reason);
    expect(auditLogs[0].reviewer.toString()).toBe(reviewerId.toString());
  });

  test('Health check endpoint /api/health responds with 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('LifeLink API');
  });
});
