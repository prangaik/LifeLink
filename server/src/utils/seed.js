import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import DonorResponse from '../models/DonorResponse.js';
import Notification from '../models/Notification.js';
import ReviewLog from '../models/ReviewLog.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting LifeLink demonstration database seeding...');
    await connectDB();

    // Clear existing collections
    await User.deleteMany({});
    await BloodRequest.deleteMany({});
    await DonorResponse.deleteMany({});
    await Notification.deleteMany({});
    await ReviewLog.deleteMany({});

    console.log('🧹 Existing demo records cleared.');

    // 1. Create Reviewer / Admin account
    const reviewer = await User.create({
      name: 'Dr. Anita Joshi (Reviewer)',
      email: 'reviewer@lifelink.org',
      password: 'Password@123',
      phone: '+91 98220 11223',
      role: 'reviewer',
      bloodGroup: 'O+',
      city: 'Pune',
      location: {
        type: 'Point',
        coordinates: [73.8567, 18.5204],
      },
      notificationConsent: true,
      notificationChannel: 'in-app',
      isPhoneVerified: true,
      isMedicallyVerified: true,
    });

    // 2. Create Requester account
    const requester = await User.create({
      name: 'Rahul Kulkarni (Requester)',
      email: 'requester@lifelink.org',
      password: 'Password@123',
      phone: '+91 98220 44556',
      role: 'requester',
      bloodGroup: 'B+',
      city: 'Pune',
      location: {
        type: 'Point',
        coordinates: [73.8743, 18.5308], // Sassoon General Hospital area
      },
      notificationConsent: true,
      notificationChannel: 'in-app',
      isPhoneVerified: true,
    });

    // 3. Create Sample Donors around Pune
    const donorSeeds = [
      {
        name: 'Aarav Mehta [Sample Donor]',
        email: 'aarav.donor@lifelink.org',
        password: 'Password@123',
        phone: '+91 98221 00001',
        role: 'donor',
        bloodGroup: 'O+',
        city: 'Pune',
        location: { type: 'Point', coordinates: [73.8765, 18.5312] }, // ~1.5km from Sassoon
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
        bloodGroup: 'O-', // Universal donor
        city: 'Pune',
        location: { type: 'Point', coordinates: [73.8821, 18.5365] }, // ~2.2km
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
        location: { type: 'Point', coordinates: [73.8412, 18.5144] }, // ~3.5km (Deccan)
        isAvailable: true,
        notificationConsent: true,
        notificationChannel: 'simulated-whatsapp',
        isPhoneVerified: true,
      },
      {
        name: 'Sneha Patil [Sample Donor]',
        email: 'sneha.donor@lifelink.org',
        password: 'Password@123',
        phone: '+91 98221 00004',
        role: 'donor',
        bloodGroup: 'A+',
        city: 'Pune',
        location: { type: 'Point', coordinates: [73.8298, 18.5089] }, // ~4.8km
        isAvailable: true,
        notificationConsent: true,
        notificationChannel: 'in-app',
        isPhoneVerified: false,
      },
      {
        name: 'Rohan Shinde [Sample Donor]',
        email: 'rohan.donor@lifelink.org',
        password: 'Password@123',
        phone: '+91 98221 00005',
        role: 'donor',
        bloodGroup: 'AB+',
        city: 'Pune',
        location: { type: 'Point', coordinates: [73.8012, 18.5582] }, // ~8km (Aundh)
        isAvailable: true,
        notificationConsent: true,
        notificationChannel: 'in-app',
        isPhoneVerified: true,
      },
    ];

    const donors = await User.create(donorSeeds);
    console.log(`✅ Created ${donors.length} sample donors + 1 reviewer + 1 requester.`);

    // 4. Create sample blood requests
    const sampleRequest1 = await BloodRequest.create({
      requester: requester._id,
      patientName: 'P. Kulkarni',
      bloodGroup: 'B+',
      unitsRequired: 2,
      hospitalName: 'Jehangir Hospital',
      city: 'Pune',
      location: {
        type: 'Point',
        coordinates: [73.8778, 18.5305],
      },
      urgency: 'critical',
      status: 'verified',
      reviewStatus: 'approved',
      reviewedBy: reviewer._id,
      reviewedAt: new Date(),
      reviewNotes: 'Hospital requisition slip cross-verified with Jehangir emergency desk.',
      searchRadiusKm: 20,
      contactPhone: '+91 98220 44556',
      additionalNotes: 'Urgent surgery scheduled at 4 PM today. Plasma & whole blood compatible.',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      matchedDonorCount: 2,
      responsesCount: { interested: 1, declined: 0 },
    });

    const sampleRequest2 = await BloodRequest.create({
      requester: requester._id,
      patientName: 'M. Shinde',
      bloodGroup: 'O+',
      unitsRequired: 1,
      hospitalName: 'Ruby Hall Clinic',
      city: 'Pune',
      location: {
        type: 'Point',
        coordinates: [73.8812, 18.5342],
      },
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

    // 5. Create sample donor response
    await DonorResponse.create({
      request: sampleRequest1._id,
      donor: donors[2]._id, // Vikram Deshmukh (B+)
      status: 'interested',
      message: 'I am nearby in Deccan and can reach Jehangir Hospital within 45 minutes.',
      respondedAt: new Date(),
    });

    // 6. Create sample ReviewLog
    await ReviewLog.create({
      request: sampleRequest1._id,
      reviewer: reviewer._id,
      action: 'approved',
      decisionReason: 'Hospital requisition slip cross-verified with Jehangir emergency desk.',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (LifeLink In-App Review)',
    });

    // 7. Create sample notification
    await Notification.create({
      recipient: requester._id,
      request: sampleRequest1._id,
      type: 'response_received',
      title: '🤝 Donor Available: Vikram Deshmukh expressed interest',
      message: 'Vikram Deshmukh (B+) is interested in donating for your request at Jehangir Hospital.',
      channel: 'in-app',
      isRead: false,
    });

    console.log('✅ Demo seed completed successfully!');
    console.log('\nSample Login Credentials for Evaluation:');
    console.log('1. Reviewer:  reviewer@lifelink.org  /  Password@123');
    console.log('2. Requester: requester@lifelink.org /  Password@123');
    console.log('3. Donor:     aarav.donor@lifelink.org / Password@123');
    console.log('4. Donor (B+): vikram.donor@lifelink.org / Password@123');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await disconnectDB();
  }
};

seedDatabase();
