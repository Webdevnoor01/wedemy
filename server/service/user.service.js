const userModel = require("../models/user.model");
class UserService {
  // get user by user id
  async getUserById(userId) {
    try {
      const user = await userModel.findById(userId);
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

  // get user by payload. payload will be an object.
  async getUser(payload) {
    try {
      const user = await userModel.findOne(payload);
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

  //   create a new user
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
}

module.exports = new UserService();
