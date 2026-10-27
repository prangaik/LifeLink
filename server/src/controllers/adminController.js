import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import ReviewLog from '../models/ReviewLog.js';
import notificationService from '../services/notificationService.js';

/**
 * @route   GET /api/admin/metrics
 * @desc    Get dashboard metrics for reviewers/administrators
 * @access  Private (Reviewer/Admin only)
 */
export const getAdminMetrics = async (req, res, next) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const availableDonors = await User.countDocuments({ role: 'donor', isAvailable: true });
    const totalRequests = await BloodRequest.countDocuments();
    const pendingReviewRequests = await BloodRequest.countDocuments({
      status: { $in: ['pending_review', 'unverified'] },
      expiresAt: { $gt: new Date() },
    });
    const verifiedRequests = await BloodRequest.countDocuments({ status: 'verified' });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'fulfilled' });

    res.status(200).json({
      success: true,
      metrics: {
        totalDonors,
        availableDonors,
        totalRequests,
        pendingReviewRequests,
        verifiedRequests,
        fulfilledRequests,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/requests
 * @desc    Get all requests for review review pipeline
 * @access  Private (Reviewer/Admin only)
 */
export const getRequestsForReview = async (req, res, next) => {
  try {
    const { status, reviewStatus } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (reviewStatus) filter.reviewStatus = reviewStatus;

    const requests = await BloodRequest.find(filter)
      .populate('requester', 'name email phone')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/admin/requests/:id/review
 * @desc    Submit review decision (approved or rejected) for a blood request
 * @access  Private (Reviewer/Admin only)
 */
export const reviewRequest = async (req, res, next) => {
  try {
    const { action, decisionReason } = req.body;
    const { id } = req.params;

    if (!['approved', 'rejected', 'flagged'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'approved', 'rejected', or 'flagged'.",
      });
    }

    if (!decisionReason || decisionReason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A descriptive decisionReason (minimum 5 characters) is required for the audit log.',
      });
    }

    const bloodRequest = await BloodRequest.findById(id).populate('requester');
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.',
      });
    }

    // Determine new status based on reviewer action
    const newStatus = action === 'approved' ? 'verified' : action === 'rejected' ? 'rejected' : bloodRequest.status;
    const newReviewStatus = action === 'approved' ? 'approved' : 'rejected';

    bloodRequest.status = newStatus;
    bloodRequest.reviewStatus = newReviewStatus;
    bloodRequest.reviewedBy = req.user._id;
    bloodRequest.reviewedAt = new Date();
    bloodRequest.reviewNotes = decisionReason;

    await bloodRequest.save();

    // Create persistent immutable audit log
    const auditLog = await ReviewLog.create({
      request: bloodRequest._id,
      reviewer: req.user._id,
      action,
      decisionReason,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    // Notify the requester
    const notificationTitle =
      action === 'approved'
        ? '✅ Blood Request Verified by Authorized Reviewer'
        : '⚠️ Blood Request Review Update';

    const notificationMessage =
      action === 'approved'
        ? `Your blood request for ${bloodRequest.bloodGroup} at ${bloodRequest.hospitalName} has been verified by our review team. Notes: "${decisionReason}".`
        : `Your blood request for ${bloodRequest.bloodGroup} at ${bloodRequest.hospitalName} was reviewed with decision '${action}'. Reason: "${decisionReason}".`;

    await notificationService.send({
      recipientId: bloodRequest.requester._id,
      requestId: bloodRequest._id,
      type: action === 'approved' ? 'request_verified' : 'request_rejected',
      title: notificationTitle,
      message: notificationMessage,
      preferredChannel: bloodRequest.requester.notificationChannel,
    });

    res.status(200).json({
      success: true,
      message: `Request marked as ${newStatus} with audit log recorded.`,
      request: bloodRequest,
      auditLog,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Fetch audit log entries for reviewer actions
 * @access  Private (Reviewer/Admin only)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await ReviewLog.find()
      .populate('reviewer', 'name email role')
      .populate('request', 'hospitalName bloodGroup city status')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    next(err);
  }
};
