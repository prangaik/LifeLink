import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient identifier/initials required'],
      trim: true,
      maxlength: 60,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required'],
      index: true,
    },
    unitsRequired: {
      type: Number,
      required: [true, 'Units required is mandatory'],
      min: [1, 'Minimum 1 unit required'],
      max: [20, 'Maximum 20 units per request'],
      default: 1,
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital or blood bank name is required'],
      trim: true,
      maxlength: 120,
    },
    state: {
      type: String,
      default: 'Maharashtra',
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    hospitalAddress: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    // Hospital / Emergency location coordinates [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: [true, 'Coordinates [lng, lat] are required'],
      },
    },
    urgency: {
      type: String,
      enum: ['critical', 'high', 'moderate'],
      default: 'high',
    },
    status: {
      type: String,
      enum: ['pending_review', 'unverified', 'verified', 'fulfilled', 'cancelled', 'expired', 'rejected'],
      default: 'unverified', // unverified until reviewed or auto-staged
      index: true,
    },
    reviewStatus: {
      type: String,
      enum: ['unreviewed', 'approved', 'rejected'],
      default: 'unreviewed',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    searchRadiusKm: {
      type: Number,
      default: 25,
      min: 1,
      max: 100,
    },
    contactPhone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      trim: true,
    },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    matchedDonorCount: {
      type: Number,
      default: 0,
    },
    responsesCount: {
      interested: { type: Number, default: 0 },
      declined: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for distance queries
bloodRequestSchema.index({ location: '2dsphere' });
bloodRequestSchema.index({ status: 1, bloodGroup: 1, expiresAt: 1 });

// Helper method to check if request is active for matching/responses
bloodRequestSchema.methods.isActive = function () {
  const isExpired = new Date() > new Date(this.expiresAt);
  const validStatus = ['unverified', 'verified'].includes(this.status);
  return validStatus && !isExpired;
};

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export default BloodRequest;
