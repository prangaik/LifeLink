import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Notification Service Abstraction
 * Supports in-app notifications and simulated WhatsApp provider.
 * Complies with project rule: Never incur real WhatsApp charges or send unsolicited SMS.
 */
class NotificationService {
  /**
   * Dispatch a notification to a specific recipient
   */
  async send({ recipientId, requestId = null, type, title, message, preferredChannel = null }) {
    const user = await User.findById(recipientId);
    if (!user) return null;

    // Check explicit user consent
    if (!user.notificationConsent) {
      console.log(`[Notification] Skipped for user ${user._id}: notificationConsent is false.`);
      return null;
    }

    const channel = preferredChannel || user.notificationChannel || 'in-app';
    let simulatedMetadata = {
      isSimulated: false,
    };

    if (channel === 'simulated-whatsapp') {
      simulatedMetadata = {
        isSimulated: true,
        recipientPhone: user.phone,
        dispatchedAt: new Date(),
        note: '[SIMULATED WHATSAPP PROVIDER] Demonstration only. No telecom gateway charges incurred.',
      };

      console.log(
        `\n================= 📲 [SIMULATED WHATSAPP MESSAGE] =================\n` +
        `To: ${user.phone} (${user.name})\n` +
        `Subject: ${title}\n` +
        `Body:\n${message}\n` +
        `Disclaimer: This is a safe local development simulation for academic evaluation.\n` +
        `==================================================================\n`
      );
    }

    const notification = await Notification.create({
      recipient: recipientId,
      request: requestId,
      type,
      title,
      message,
      channel,
      simulatedMetadata,
      isRead: false,
    });

    return notification;
  }

  /**
   * Notify multiple matched donors about an emergency blood request
   */
  async notifyMatchedDonors({ donors, bloodRequest }) {
    const notifications = [];
    for (const donor of donors) {
      const title = `🚨 Urgent Blood Request: ${bloodRequest.bloodGroup} needed`;
      const message =
        `Hospital: ${bloodRequest.hospitalName}, ${bloodRequest.city}. ` +
        `Required Units: ${bloodRequest.unitsRequired}. Urgency: ${bloodRequest.urgency.toUpperCase()}. ` +
        `Please open LifeLink to review and respond if you are safely available.`;

      const notification = await this.send({
        recipientId: donor._id,
        requestId: bloodRequest._id,
        type: 'emergency_match',
        title,
        message,
        preferredChannel: donor.notificationChannel,
      });

      if (notification) {
        notifications.push(notification);
      }
    }
    return notifications;
  }
}

export default new NotificationService();
