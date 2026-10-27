import mongoose from 'mongoose';

const donorResponseSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
      index: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['invited', 'interested', 'declined', 'completed', 'cancelled'],
      default: 'invited',
    },
    message: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique response per donor per request
donorResponseSchema.index({ request: 1, donor: 1 }, { unique: true });

const DonorResponse = mongoose.model('DonorResponse', donorResponseSchema);
export default DonorResponse;
