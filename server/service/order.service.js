const orderModel = require("../models/order.model");
const { Types } = require("mongoose");
class OrderService {
  /**
   *
   * @param {Object} data enter new order required data
   * @returns {{courseId:String, userId:String, paymentInfo?:String, _id:Types.      ObjectId} | {error:Boolean, message:String}}
   */
  async create(data) {
    try {
      // code gose here
      const newOrder = await orderModel.create(data);
      if (!newOrder)
        return {
          error: true,
          message: "Error to create order",
        };
      return newOrder;
    } catch (error) {
        throw new Error(error.message)
    }
  }
}

module.exports = new OrderService();
