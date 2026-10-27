import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
    },
    type: {
      type: String,
      enum: [
        'emergency_match',
        'response_received',
        'request_verified',
        'request_rejected',
        'request_cancelled',
        'status_update',
        'system'
      ],
      default: 'emergency_match',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    channel: {
      type: String,
      enum: ['in-app', 'simulated-whatsapp'],
      default: 'in-app',
    },
    simulatedMetadata: {
      isSimulated: { type: Boolean, default: false },
      recipientPhone: String,
      dispatchedAt: Date,
      note: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
