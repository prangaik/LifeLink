import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import BloodRequest from './models/BloodRequest.js';
import DonorResponse from './models/DonorResponse.js';
import Notification from './models/Notification.js';
import ReviewLog from './models/ReviewLog.js';

const PORT = process.env.PORT || 5050;

const seedInitialDataIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 [DB] Database is empty. Seeding initial demonstration records...');
      // 1. Create Reviewer
      const reviewer = await User.create({
        name: 'Dr. Anita Joshi (Reviewer)',
        email: 'reviewer@lifelink.org',
        password: 'Password@123',
        phone: '+91 98220 11223',
        role: 'reviewer',
        bloodGroup: 'O+',
        city: 'Pune',
        location: { type: 'Point', coordinates: [73.8567, 18.5204] },
        notificationConsent: true,
        notificationChannel: 'in-app',
        isPhoneVerified: true,
        isMedicallyVerified: true,
      });

      // 2. Create Requester
      const requester = await User.create({
        name: 'Rahul Kulkarni (Requester)',
        email: 'requester@lifelink.org',
        password: 'Password@123',
        phone: '+91 98220 44556',
        role: 'requester',
        bloodGroup: 'B+',
        city: 'Pune',
        location: { type: 'Point', coordinates: [73.8743, 18.5308] },
        notificationConsent: true,
        notificationChannel: 'in-app',
        isPhoneVerified: true,
      });

      // 3. Create Sample Donors
      const donors = await User.create([
        {
          name: 'Aarav Mehta [Sample Donor]',
          email: 'aarav.donor@lifelink.org',
          password: 'Password@123',
          phone: '+91 98221 00001',
          role: 'donor',
          bloodGroup: 'O+',
          city: 'Pune',
          location: { type: 'Point', coordinates: [73.8765, 18.5312] },
          isAvailable: true,
          notificationConsent: true,
          notificationChannel: 'simulated-whatsapp',
          isPhoneVerified: true,
        },
        {
          name: 'Pooja Sharma [Sample Donor]',
          email: 'pooja.donor@lifelink.org',
          password: 'Password@123',
          phone: '+91 98221 00002',
          role: 'donor',
          bloodGroup: 'O-',
          city: 'Pune',
          location: { type: 'Point', coordinates: [73.8821, 18.5365] },
          isAvailable: true,
          notificationConsent: true,
          notificationChannel: 'in-app',
          isPhoneVerified: true,
        },
        {
          name: 'Vikram Deshmukh [Sample Donor]',
          email: 'vikram.donor@lifelink.org',
          password: 'Password@123',
          phone: '+91 98221 00003',
          role: 'donor',
          bloodGroup: 'B+',
          city: 'Pune',
          location: { type: 'Point', coordinates: [73.8412, 18.5144] },
          isAvailable: true,
          notificationConsent: true,
          notificationChannel: 'simulated-whatsapp',
          isPhoneVerified: true,
        },
      ]);

      // 4. Sample Blood Requests
      const req1 = await BloodRequest.create({
        requester: requester._id,
        patientName: 'P. Kulkarni',
        bloodGroup: 'B+',
        unitsRequired: 2,
        hospitalName: 'Jehangir Hospital, Pune',
        city: 'Pune',
        location: { type: 'Point', coordinates: [73.8778, 18.5305] },
        urgency: 'critical',
        status: 'verified',
        reviewStatus: 'approved',
        reviewedBy: reviewer._id,
        reviewedAt: new Date(),
        reviewNotes: 'Hospital requisition slip cross-verified with Jehangir emergency desk.',
        searchRadiusKm: 20,
        contactPhone: '+91 98220 44556',
        additionalNotes: 'Urgent surgery scheduled at 4 PM today.',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        matchedDonorCount: 2,
        responsesCount: { interested: 1, declined: 0 },
      });

      const req2 = await BloodRequest.create({
        requester: requester._id,
        patientName: 'M. Shinde',
        bloodGroup: 'O+',
        unitsRequired: 1,
        hospitalName: 'Ruby Hall Clinic, Pune',
        city: 'Pune',
        location: { type: 'Point', coordinates: [73.8812, 18.5342] },
        urgency: 'high',
        status: 'unverified',
        reviewStatus: 'unreviewed',
        searchRadiusKm: 25,
        contactPhone: '+91 98220 44556',
        additionalNotes: 'Scheduled orthopedic procedure.',
        expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
        matchedDonorCount: 2,
        responsesCount: { interested: 0, declined: 0 },
      });

      await DonorResponse.create({
        request: req1._id,
        donor: donors[2]._id,
        status: 'interested',
        message: 'I am nearby in Deccan and can reach Jehangir Hospital within 45 minutes.',
        respondedAt: new Date(),
      });

      await ReviewLog.create({
        request: req1._id,
        reviewer: reviewer._id,
        action: 'approved',
        decisionReason: 'Hospital requisition slip cross-verified with Jehangir emergency desk.',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (LifeLink In-App Review)',
      });

      console.log('✅ [DB] Initial demonstration records seeded successfully.');
    }
  } catch (err) {
    console.warn('[DB] Auto-seed warning:', err.message);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await seedInitialDataIfEmpty();

    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 LifeLink API Server running in [${process.env.NODE_ENV || 'development'}] mode`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
      console.log(`======================================================\n`);
    });

    const shutdown = async () => {
      console.log('\n[Server] Graceful shutdown initiated...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
