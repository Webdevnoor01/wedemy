const userModel = require("../models/user.model");
const { redis } = require("../utils/redis");
const cloudinary = require("../config/cloudinary.config");
class UserService {
  // create a new user
  async create(payload) {
    try {
      if (!payload)
        return {
          error: true,
          message: "Please provide sufficient data to create user",
        };
      const user = await userModel.create(payload);
      if (!user) {
        return {
          error: true,
          message: "Error to create user",
        };
      }

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // get user by user id
  /**
   *
   * @param {*} userId enter user id
   * @returns {{_id:String,name:String, email:String, avatar:object, role:String, isVerified:String, cources:Array, createdAt:Date, updatedAt:Date} | {error:Boolean, message:string}}
   */
  async getUserById(userId) {
    try {
      const user = await redis.get(userId);
      if (!user) {
        return {
          error: true,
          message: "user not found",
        };
      }

      return JSON.parse(user);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // get user by payload. payload will be an object.
  /**
   *
   * @param {String} payload enter user id
   * @param {Object} options enter the payload
   * @returns {{_id:String,name:String, email:String, avatar:object, role:String, isVerified:String, cources:Array, createdAt:Date, updatedAt:Date} | {error:Boolean, message:string}}
   */
  async getUser(payload, options) {
    try {
      const user = await userModel.findOne(payload).select(options);
      if (!user) {
        return {
          error: true,
          message: "user not found",
        };
      }

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // update user info
  /**
   *
   * @param {String} userId enter user id
   * @param {Object} payload enter the payload
   * @returns {{_id:String,name:String, email:String, avatar:object, role:String, isVerified:String, cources:Array, createdAt:Date, updatedAt:Date} | {error:Boolean, message:string}}
   */
  async update(userId, payload) {
    try {
      if (!userId || !payload) {
        return {
          error: true,
          message: "userId and payload is required",
        };
      }

      const user = await userModel.findByIdAndUpdate(userId, payload);

      const updatedUser = await this.getUser({ _id: user._id });
      if (!user) {
        return {
          error: true,
          message: "Error to update user info",
        };
      }

      return updatedUser;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  // upload user avatar
  async uploadImage(image, folder) {

    try {
      console.log(image.filepath)
      const result = await cloudinary.uploader.upload(image.filepath, {
        folder,
      });
      if (!result)
        return {
          error: true,
          message: "Failed to upload image, please try again",
        };
      return {
        publicId: result.public_id,
        url: result.url,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }
}

module.exports = new UserService();
