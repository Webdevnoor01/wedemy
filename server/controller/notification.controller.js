// node cron
const cron = require("node-cron");

// services
const notificationService = require("../service/notification.service");
// error handler
const ErrorHandler = require("../utils/errorHandler");
class NotificationController {
  async getAllNotification(req, res, next) {
    try {
      const notifications = await notificationService.get();
      if (notifications.error)
        return next(new ErrorHandler(notifications.message, 400));

      res.status(200).json({
        success: true,
        notifications: notifications,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }

  async updateNotificationStatus(req, res, next) {
    const notificationId = req.params.notificationId;
    try {
      // is notification exist
      const isNotification = await notificationService.getById(notificationId);
      if (isNotification.error)
        return next(new ErrorHandler(isNotification.message, 400));
      // update notification status "unread" to read
      const notificationPayload = {
        status: "read",
      };
      const updateNotification = await notificationService.update(
        notificationId,
        notificationPayload
      );
      if (updateNotification.error)
        return next(new ErrorHandler(updateNotification.message, 400));

      res.status(200).json({
        success: true,
        message: "Notification status updated successfully",
        notification: updateNotification,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
}

// delete thirty days ago read notificatins with cron job 
cron.schedule("0 0 0 * * *", () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const notification = notificationService.delete({
    status: "read",
    createdAt: { $lt: thirtyDaysAgo },
  });
  if (notification.error) console.log(notification.error);
  if (!notification.error)
    console.log("Thirty days ago notification deleted successfully");
});

module.exports = new NotificationController();
