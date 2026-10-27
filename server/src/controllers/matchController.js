import BloodRequest from '../models/BloodRequest.js';
import matchingService from '../services/matchingService.js';

/**
 * @route   GET /api/requests/:id/matches
 * @desc    Get discovered potential donor matches for a blood request
 * @access  Private (Request owner or reviewer/admin)
 */
export const getPotentialMatches = async (req, res, next) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found',
      });
    }

    // Authorization check
    const isOwner = bloodRequest.requester.toString() === req.user._id.toString();
    const isPrivileged = ['reviewer', 'admin'].includes(req.user.role);
    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view matched donor listings for someone else’s request.',
      });
    }

    // Request active check
    if (!bloodRequest.isActive()) {
      return res.status(400).json({
        success: false,
        message: `Cannot discover donors: this request is currently ${bloodRequest.status}.`,
      });
    }

    const strict = req.query.strict === 'true';
    const limit = parseInt(req.query.limit, 10) || 20;

    const matches = await matchingService.findMatches(bloodRequest, {
      strictBloodMatch: strict,
      maxDonors: limit,
    });

    res.status(200).json({
      success: true,
      count: matches.length,
      searchRadiusKm: bloodRequest.searchRadiusKm,
      strictMatching: strict,
      matches,
      disclaimer:
        'Notice: Discovered matches represent registered, potentially available volunteers within radius. Software does not verify medical compatibility or guarantee availability.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/requests/:id/invite
 * @desc    Invite selected donors to respond to the request
 * @access  Private (Request owner only)
 */
export const inviteSelectedDonors = async (req, res, next) => {
  try {
    const { donorIds } = req.body;

    if (!Array.isArray(donorIds) || donorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of donorIds to invite.',
      });
    }

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
        message: 'Forbidden: Only the request owner can invite donors.',
      });
    }

    if (!bloodRequest.isActive()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot invite donors for an inactive, expired, or cancelled request.',
      });
    }

    const result = await matchingService.inviteDonors(bloodRequest, donorIds);

    res.status(200).json({
      success: true,
      message: `Successfully invited ${result.invitedCount} donor(s).`,
      result,
    });
  } catch (err) {
    next(err);
  }
};
