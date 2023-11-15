const notificationModel = require("../models/notification.model");
const { Types } = require("mongoose");
class NotificationService {
  /**
   *
   * @param {Object} data enter new order required data
   * @returns {{title:String, message:String, status:String, _id:Types.ObjectId} | {error:Boolean, message:String}}
   */
  async create(data) {
    try {
      // code gose here
      const newNotification = await notificationModel.create(data);
      if (!newNotification)
        return {
          error: true,
          message: "Error to create notification",
        };
      return newNotification;
    } catch (error) {
        throw new Error(error.message)
    }
  }
}

module.exports = new NotificationService();
