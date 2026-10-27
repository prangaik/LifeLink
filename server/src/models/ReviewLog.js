import mongoose from 'mongoose';

const reviewLogSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['approved', 'rejected', 'flagged'],
      required: true,
    },
    decisionReason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewLogSchema.index({ request: 1, createdAt: -1 });

const ReviewLog = mongoose.model('ReviewLog', reviewLogSchema);
export default ReviewLog;
