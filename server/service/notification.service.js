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

  // get all notification
  /**
   * 
   * @returns {[{title:String, message:String, status:String, user:Object}] | {error:Boolean, message:String} } 
   */
  async get(){
    try {
      const notifications = await notificationModel.find().sort({createdAt:-1})
      if(notifications.length <=0) return {error:true, message:"No notificaiton found"}
      return notifications
    } catch (error) {
      throw new Error(error.message)
    }
  }
  // get single notification
  /**
   * @param {String} notificationId 
   * @returns {[{title:String, message:String, status:String, user:Object}] | {error:Boolean, message:String} } 
   */
  async getById(notificationId){
    try {
      const notification = await notificationModel.findById(notificationId)
      if(!notification) return {error:true, message:"No notificaiton found"}
      return notification
    } catch (error) {
      throw new Error(error.message)
    }
  }

  /**
   * 
   * @param {String} notiricationId enter notification Id
   * @param {Object} payload enter notification payload
   * @returns {{title:String, message:String, status:String, _id:Types.ObjectId} | {error:Boolean, message:String}}
   */
  async update(notiricationId, payload){
    try {
      const updateNotification = await notificationModel.updateOne({_id:notiricationId},payload)
      if(!updateNotification) return { error:true, message:"Error to update notification"}

      const notification = await this.getById(notiricationId)
      return notification
    } catch (error) {
      throw new Error(error.message)
    }
  }

  // delete notifications 
  async delete(filter){
    const notificaiton = await notificationModel.deleteMany(filter)
    if(!notificaiton.data) return {error:true, message:"Error to delete notifications"}
    return notificaiton
  }
}

module.exports = new NotificationService();
