import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB } from './setup.js';
import User from '../src/models/User.js';
import BloodRequest from '../src/models/BloodRequest.js';

setupTestDB();

describe('Request Creation, Geospatial Matching, and Donor Response Tests', () => {
  let requesterToken;
  let requesterId;
  let donorToken;
  let donorId;
  let strangerToken;

  beforeEach(async () => {
    // 1. Create Requester (Location: Ruby Hall, Pune [73.8812, 18.5342])
    const reqRes = await request(app).post('/api/auth/register').send({
      name: 'Requester Amit',
      email: 'amit@example.com',
      password: 'Password@123',
      phone: '+91 98000 00001',
      role: 'requester',
      bloodGroup: 'B+',
      city: 'Pune',
      latitude: 18.5342,
      longitude: 73.8812,
    });
    requesterToken = reqRes.body.token;
    requesterId = reqRes.body.user._id;

    // 2. Create Donor (Location: Jehangir, Pune [73.8778, 18.5305] ~600m away, BloodGroup: B+)
    const donRes = await request(app).post('/api/auth/register').send({
      name: 'Donor Rohan',
      email: 'rohan@example.com',
      password: 'Password@123',
      phone: '+91 98000 00002',
      role: 'donor',
      bloodGroup: 'B+',
      city: 'Pune',
      latitude: 18.5305,
      longitude: 73.8778,
    });
    donorToken = donRes.body.token;
    donorId = donRes.body.user._id;

    // 3. Create Stranger (Not the owner of the request)
    const strRes = await request(app).post('/api/auth/register').send({
      name: 'Stranger User',
      email: 'stranger@example.com',
      password: 'Password@123',
      phone: '+91 98000 00003',
      role: 'donor',
      bloodGroup: 'A+',
      city: 'Pune',
      latitude: 18.5204,
      longitude: 73.8567,
    });
    strangerToken = strRes.body.token;
  });

  test('POST /api/requests fails validation with missing required fields', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        patientName: 'Test Patient',
        // missing bloodGroup, hospitalName, latitude, longitude
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/requests creates request and initiates donor discovery', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        patientName: 'P. Sharma',
        bloodGroup: 'B+',
        unitsRequired: 2,
        hospitalName: 'Ruby Hall Clinic',
        city: 'Pune',
        latitude: 18.5342,
        longitude: 73.8812,
        urgency: 'critical',
        contactPhone: '+91 98000 00001',
        searchRadiusKm: 15,
        expiryHours: 24,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.request.bloodGroup).toBe('B+');
    expect(res.body.request.status).toBe('unverified');
    expect(res.body.request.expiresAt).toBeDefined();
  });

  test('GET /api/requests/:id/matches discovers eligible nearby donors and excludes requester', async () => {
    // Create BloodRequest
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        patientName: 'P. Sharma',
        bloodGroup: 'B+',
        unitsRequired: 1,
        hospitalName: 'Ruby Hall Clinic',
        city: 'Pune',
        latitude: 18.5342,
        longitude: 73.8812,
        urgency: 'high',
        contactPhone: '+91 98000 00001',
        searchRadiusKm: 20,
      });

    const requestId = reqRes.body.request._id;

    // Query matches as the requester
    const matchRes = await request(app)
      .get(`/api/requests/${requestId}/matches`)
      .set('Authorization', `Bearer ${requesterToken}`);

    expect(matchRes.status).toBe(200);
    expect(matchRes.body.success).toBe(true);
    expect(Array.isArray(matchRes.body.matches)).toBe(true);

    // Verify donor Rohan is found
    const foundDonor = matchRes.body.matches.find((m) => m._id === donorId);
    expect(foundDonor).toBeDefined();
    expect(foundDonor.bloodGroup).toBe('B+');
    expect(foundDonor.approximateDistanceKm).toBeLessThan(5);

    // Verify requester is excluded from matching results
    const foundRequester = matchRes.body.matches.find((m) => m._id === requesterId);
    expect(foundRequester).toBeUndefined();
  });

  test('Stranger cannot access matches or cancel someone else request', async () => {
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        patientName: 'P. Sharma',
        bloodGroup: 'B+',
        unitsRequired: 1,
        hospitalName: 'Ruby Hall Clinic',
        city: 'Pune',
        latitude: 18.5342,
        longitude: 73.8812,
        urgency: 'high',
        contactPhone: '+91 98000 00001',
      });

    const requestId = reqRes.body.request._id;

    // Stranger attempts to view matches
    const matchRes = await request(app)
      .get(`/api/requests/${requestId}/matches`)
      .set('Authorization', `Bearer ${strangerToken}`);
    expect(matchRes.status).toBe(403);

    // Stranger attempts to cancel request
    const cancelRes = await request(app)
      .patch(`/api/requests/${requestId}/cancel`)
      .set('Authorization', `Bearer ${strangerToken}`);
    expect(cancelRes.status).toBe(403);
  });

  test('Donor can respond "interested" and requester tracks count', async () => {
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        patientName: 'P. Sharma',
        bloodGroup: 'B+',
        unitsRequired: 1,
        hospitalName: 'Ruby Hall Clinic',
        city: 'Pune',
        latitude: 18.5342,
        longitude: 73.8812,
        urgency: 'high',
        contactPhone: '+91 98000 00001',
      });

    const requestId = reqRes.body.request._id;

    // Donor responds interested
    const respRes = await request(app)
      .post(`/api/responses/${requestId}`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        status: 'interested',
        message: 'I can reach Ruby Hall in 20 minutes.',
      });

    expect(respRes.status).toBe(200);
    expect(respRes.body.success).toBe(true);

    // Verify request updated with responsesCount.interested = 1
    const checkRes = await request(app)
      .get(`/api/requests/${requestId}`)
      .set('Authorization', `Bearer ${requesterToken}`);

    expect(checkRes.body.request.responsesCount.interested).toBe(1);
    expect(checkRes.body.responses.length).toBe(1);
    expect(checkRes.body.responses[0].donor._id).toBe(donorId);
  });

  test('Owner cancels request, preventing further donor responses', async () => {
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        patientName: 'P. Sharma',
        bloodGroup: 'B+',
        unitsRequired: 1,
        hospitalName: 'Ruby Hall Clinic',
        city: 'Pune',
        latitude: 18.5342,
        longitude: 73.8812,
        urgency: 'high',
        contactPhone: '+91 98000 00001',
      });

    const requestId = reqRes.body.request._id;

    // Requester cancels request
    const cancelRes = await request(app)
      .patch(`/api/requests/${requestId}/cancel`)
      .set('Authorization', `Bearer ${requesterToken}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.request.status).toBe('cancelled');

    // Donor tries to respond to cancelled request
    const respRes = await request(app)
      .post(`/api/responses/${requestId}`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        status: 'interested',
      });

    expect(respRes.status).toBe(400);
    expect(respRes.body.message).toMatch(/already cancelled/i);
  });
});
