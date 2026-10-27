import BloodRequest from '../models/BloodRequest.js';
import DonorResponse from '../models/DonorResponse.js';
import matchingService from '../services/matchingService.js';
import notificationService from './../services/notificationService.js';

/**
 * @route   POST /api/requests
 * @desc    Create a new blood request
 * @access  Private (requester/donor/admin)
 */
export const createRequest = async (req, res, next) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsRequired,
      hospitalName,
      city,
      latitude,
      longitude,
      urgency,
      searchRadiusKm,
      contactPhone,
      additionalNotes,
      expiryHours = 24,
      autoMatch = true,
    } = req.body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude are required for hospital location.',
      });
    }

    const expiresAt = new Date(Date.now() + Number(expiryHours) * 60 * 60 * 1000);

    const bloodRequest = await BloodRequest.create({
      requester: req.user._id,
      patientName,
      bloodGroup,
      unitsRequired: Number(unitsRequired) || 1,
      hospitalName,
      city,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      urgency: urgency || 'high',
      status: 'unverified', // Unverified until reviewed or processed
      searchRadiusKm: Number(searchRadiusKm) || 25,
      contactPhone: contactPhone || req.user.phone,
      additionalNotes,
      expiresAt,
    });

    // If autoMatch is enabled, discover matches immediately
    let matchedDonors = [];
    if (autoMatch) {
      try {
        const potentialMatches = await matchingService.findMatches(bloodRequest, {
          strictBloodMatch: false,
          maxDonors: 10,
        });

        if (potentialMatches.length > 0) {
          const donorIds = potentialMatches.map((m) => m._id);
          const inviteResult = await matchingService.inviteDonors(bloodRequest, donorIds);
          matchedDonors = inviteResult.donors;
        }
      } catch (matchErr) {
        console.warn(`[AutoMatch] Warning during auto matching: ${matchErr.message}`);
      }
    }

    const freshRequest = await BloodRequest.findById(bloodRequest._id);

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully.',
      request: freshRequest,
      initialMatchesInvited: matchedDonors.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/requests/my
 * @desc    Get all requests created by authenticated user
 * @access  Private
 */
export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Check and update expired status dynamically
    const now = new Date();
    const updatedRequests = requests.map((r) => {
      if (['unverified', 'verified'].includes(r.status) && new Date(r.expiresAt) < now) {
        r.status = 'expired';
      }
      return r;
    });

    res.status(200).json({
      success: true,
      count: updatedRequests.length,
      requests: updatedRequests,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/requests
 * @desc    Get active/public blood requests with optional filters
 * @access  Public
 */
export const getAllRequests = async (req, res, next) => {
  try {
    const { bloodGroup, city, status, urgency } = req.query;
    const filter = {};

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city, 'i');
    if (urgency) filter.urgency = urgency;

    if (status) {
      filter.status = status;
    } else {
      // Default: show active requests
      filter.status = { $in: ['unverified', 'verified'] };
      filter.expiresAt = { $gt: new Date() };
    }

    const requests = await BloodRequest.find(filter)
      .populate('requester', 'name')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Mask phone number for public list unless authenticated user is requester/admin
    const sanitized = requests.map((r) => {
      return {
        ...r,
        contactPhone: r.contactPhone ? r.contactPhone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : '',
      };
    });

    res.status(200).json({
      success: true,
      count: sanitized.length,
      requests: sanitized,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/requests/:id
 * @desc    Get request by ID with populated responses if owner
 * @access  Private / Public
 */
export const getRequestById = async (req, res, next) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id)
      .populate('requester', 'name email phone')
      .populate('reviewedBy', 'name');

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    // Auto-expire check
    if (['unverified', 'verified'].includes(bloodRequest.status) && new Date() > new Date(bloodRequest.expiresAt)) {
      bloodRequest.status = 'expired';
      await bloodRequest.save();
    }

    const isOwner = req.user && req.user._id.toString() === bloodRequest.requester._id.toString();
    const isPrivileged = req.user && ['reviewer', 'admin'].includes(req.user.role);

    let responses = [];
    if (isOwner || isPrivileged) {
      responses = await DonorResponse.find({ request: bloodRequest._id })
        .populate('donor', 'name bloodGroup phone city isPhoneVerified')
        .sort({ updatedAt: -1 });
    }

    res.status(200).json({
      success: true,
      request: bloodRequest,
      isOwner: Boolean(isOwner),
      responses,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/requests/:id/cancel
 * @desc    Cancel a request (Owner only)
 * @access  Private
 */
export const cancelRequest = async (req, res, next) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    if (bloodRequest.requester.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own requests.',
      });
    }

    if (['fulfilled', 'cancelled', 'expired'].includes(bloodRequest.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request that is already ${bloodRequest.status}.`,
      });
    }

    bloodRequest.status = 'cancelled';
    await bloodRequest.save();

    // Notify any donors who expressed interest
    const interestedResponses = await DonorResponse.find({
      request: bloodRequest._id,
      status: 'interested',
    });

    for (const resp of interestedResponses) {
      await notificationService.send({
        recipientId: resp.donor,
        requestId: bloodRequest._id,
        type: 'request_cancelled',
        title: 'Blood Request Cancelled',
        message: `The blood request for ${bloodRequest.bloodGroup} at ${bloodRequest.hospitalName} has been cancelled by the requester. Thank you for your willingness to help.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      request: bloodRequest,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/requests/:id/fulfill
 * @desc    Mark a request as fulfilled
 * @access  Private (Owner only)
 */
export const fulfillRequest = async (req, res, next) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    if (bloodRequest.requester.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only mark your own requests as fulfilled.',
      });
    }

    bloodRequest.status = 'fulfilled';
    await bloodRequest.save();

    res.status(200).json({
      success: true,
      message: 'Request marked as fulfilled. Thank you to all donors!',
      request: bloodRequest,
    });
  } catch (err) {
    next(err);
  }
};
