import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import DonorResponse from '../models/DonorResponse.js';
import notificationService from './notificationService.js';
import { getEligibleDonorBloodGroups } from '../utils/bloodCompatibility.js';

/**
 * Matching Service for LifeLink
 * Discovers nearby eligible, available donors using MongoDB 2dsphere index.
 */
class MatchingService {
  /**
   * Find matching donors for a given BloodRequest
   * @param {Object} bloodRequest - BloodRequest document
   * @param {Object} options - { strictBloodMatch, maxDonors }
   */
  async findMatches(bloodRequest, options = {}) {
    const { strictBloodMatch = false, maxDonors = 20 } = options;

    if (!bloodRequest.isActive()) {
      throw new Error('Cannot match donors for an inactive, expired, or cancelled request.');
    }

    const eligibleBloodGroups = getEligibleDonorBloodGroups(
      bloodRequest.bloodGroup,
      strictBloodMatch
    );

    const radiusInMeters = (bloodRequest.searchRadiusKm || 25) * 1000;
    const [reqLng, reqLat] = bloodRequest.location.coordinates;

    // Geospatial query using $nearSphere
    // Note: $nearSphere requires 2dsphere index on User.location
    const donors = await User.find({
      _id: { $ne: bloodRequest.requester }, // Exclude requester
      role: 'donor',
      isAvailable: true,
      notificationConsent: true,
      bloodGroup: { $in: eligibleBloodGroups },
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [reqLng, reqLat],
          },
          $maxDistance: radiusInMeters,
        },
      },
    })
      .limit(maxDonors)
      .lean();

    // Map to sanitized donor summaries (never expose exact GPS coordinates or phone in discovery)
    const sanitizedMatches = donors.map((donor) => {
      // Approximate distance calculation using spherical Law of Cosines / Haversine
      const distanceKm = this.calculateHaversineDistance(
        reqLat,
        reqLng,
        donor.location.coordinates[1],
        donor.location.coordinates[0]
      );

      return {
        _id: donor._id,
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        city: donor.city,
        approximateDistanceKm: Math.round(distanceKm * 10) / 10,
        isPhoneVerified: donor.isPhoneVerified,
      };
    });

    return sanitizedMatches;
  }

  /**
   * Dispatch invitations to discovered donors
   */
  async inviteDonors(bloodRequest, donorIds) {
    if (!bloodRequest.isActive()) {
      throw new Error('Cannot invite donors for an inactive or expired blood request.');
    }

    const invitedDonors = [];
    const eligibleDonors = await User.find({
      _id: { $in: donorIds, $ne: bloodRequest.requester },
      isAvailable: true,
      notificationConsent: true,
    });

    for (const donor of eligibleDonors) {
      try {
        // Upsert DonorResponse record to avoid duplicate invitations
        const existing = await DonorResponse.findOne({
          request: bloodRequest._id,
          donor: donor._id,
        });

        if (!existing) {
          await DonorResponse.create({
            request: bloodRequest._id,
            donor: donor._id,
            status: 'invited',
          });
          invitedDonors.push(donor);
        }
      } catch (err) {
        // Ignore duplicate key race conditions safely
        console.warn(`[Matching] Donor ${donor._id} already invited or error: ${err.message}`);
      }
    }

    if (invitedDonors.length > 0) {
      // Update matched count on BloodRequest
      await BloodRequest.findByIdAndUpdate(bloodRequest._id, {
        $inc: { matchedDonorCount: invitedDonors.length },
      });

      // Dispatch notifications via NotificationService
      await notificationService.notifyMatchedDonors({
        donors: invitedDonors,
        bloodRequest,
      });
    }

    return {
      invitedCount: invitedDonors.length,
      donors: invitedDonors.map((d) => ({ _id: d._id, name: d.name, bloodGroup: d.bloodGroup })),
    };
  }

  /**
   * Helper Haversine formula to compute approximate distance in km
   */
  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export default new MatchingService();
