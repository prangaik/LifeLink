import DonorResponse from '../models/DonorResponse.js';
import BloodRequest from '../models/BloodRequest.js';
import notificationService from '../services/notificationService.js';

/**
 * @route   POST /api/responses/:requestId
 * @desc    Donor accepts (interested) or declines a blood request invitation
 * @access  Private (Donor only)
 */
export const respondToRequest = async (req, res, next) => {
  try {
    const { status, message } = req.body;
    const { requestId } = req.params;
    const donorId = req.user._id;

    if (!['interested', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'interested' or 'declined'.",
      });
    }

    const bloodRequest = await BloodRequest.findById(requestId).populate('requester');
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.',
      });
    }

    if (!bloodRequest.isActive()) {
      return res.status(400).json({
        success: false,
        message: `Cannot respond: this blood request is already ${bloodRequest.status}.`,
      });
    }

    // Find or create response record
    let response = await DonorResponse.findOne({
      request: bloodRequest._id,
      donor: donorId,
    });

    const previousStatus = response ? response.status : null;

    if (!response) {
      // Direct voluntary interest or responding to alert
      response = new DonorResponse({
        request: bloodRequest._id,
        donor: donorId,
        status,
        message: message || '',
        respondedAt: new Date(),
      });
    } else {
      // Update existing invitation
      response.status = status;
      response.message = message || response.message;
      response.respondedAt = new Date();
    }

    await response.save();

    // Update aggregate counts atomically on BloodRequest
    const updateOps = {};
    if (status === 'interested' && previousStatus !== 'interested') {
      updateOps.$inc = { 'responsesCount.interested': 1 };
      if (previousStatus === 'declined') {
        updateOps.$inc['responsesCount.declined'] = -1;
      }
    } else if (status === 'declined' && previousStatus !== 'declined') {
      updateOps.$inc = { 'responsesCount.declined': 1 };
      if (previousStatus === 'interested') {
        updateOps.$inc['responsesCount.interested'] = -1;
      }
    }

    if (Object.keys(updateOps).length > 0) {
      await BloodRequest.findByIdAndUpdate(bloodRequest._id, updateOps);
    }

    // Notify the requester
    const notificationTitle =
      status === 'interested'
        ? `🤝 Donor Available: ${req.user.name} expressed interest`
        : `ℹ️ Donor Update for your request`;

    const notificationBody =
      status === 'interested'
        ? `${req.user.name} (${req.user.bloodGroup}) is interested in donating for your request at ${bloodRequest.hospitalName}. Check your request details for donor contact.`
        : `A donor was unable to fulfill your request at ${bloodRequest.hospitalName}.`;

    await notificationService.send({
      recipientId: bloodRequest.requester._id,
      requestId: bloodRequest._id,
      type: 'response_received',
      title: notificationTitle,
      message: notificationBody,
      preferredChannel: bloodRequest.requester.notificationChannel,
    });

    res.status(200).json({
      success: true,
      message: `Your response (${status}) has been recorded. Thank you for your support!`,
      response,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/responses/my-alerts
 * @desc    Get all invitations and alerts received by current donor
 * @access  Private
 */
export const getMyAlerts = async (req, res, next) => {
  try {
    const responses = await DonorResponse.find({ donor: req.user._id })
      .populate({
        path: 'request',
        populate: { path: 'requester', select: 'name phone email' },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: responses.length,
      alerts: responses,
    });
  } catch (err) {
    next(err);
  }
};
