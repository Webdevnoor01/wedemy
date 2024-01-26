const ErrorHandler = require("../utils/errorHandler");
const ejs = require("ejs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { formidable } = require("formidable");

// cash database
const { redis } = require("../utils/redis");
// model
const User = require("../models/user.model");
// services
const hashService = require("../service/hash.service");
const tokenService = require("../service/token.service");
const mailService = require("../service/mail.service");
const userService = require("../service/user.service");
const generateLast12MonthsData = require("../utils/analytic.generator");
class UserController {
  // register user
  async register(req, res, next) {
    const { name, email, password } = req.body;
    try {
      console.log(req.body);
      if (!name || !email || !password) {
        // res.status(400).json({
        //   success:false,
        //   message:"Please enter all required fields"
        // })
        return next(new ErrorHandler("Please enter all required fields", 400));
      }
      //   check the email is already exists
      const isEmailAlreadyExist = await User.findOne({ email });
      if (isEmailAlreadyExist) {
        return next(new ErrorHandler("Email is already exists", 400));
      }
      // hash the password
      const hashedPassword = await hashService.hash(password);

      // preaper payload for creating user
      const userPayload = {
        name,
        email,
        password: hashedPassword,
      };
      // create user
      // user will create when the user activate his/her account
      // creating token and activation code
      const { activationCode, token } =
        await tokenService.createActivationToken(userPayload);

      const data = { user: { name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );
      try {
        // sending activation mail to the register user
        const mail = await mailService.send(
          email,
          "Account Activation",
          "activation-mail.ejs",
          data
        );
        res.status(201).json({
          success: true,
          message: `Please check your email ${email} to activate your account.`,
          token,
        });
      } catch (error) {
        console.log("error-->", error);
        return next(new ErrorHandler(error.message, error.status || 500, res));
      }
    } catch (error) {
      console.log("error->", error);
      return next(new ErrorHandler(error.message, error.status || 500, res));
    }
  }

  // activate user
  async activateUser(req, res, next) {
    const { token, activationCode } = req.body;
    try {
      // checking that are all the required fields provided?
      if (!token || !activationCode)
        return next(
          new ErrorHandler("token and activationCode is required", 400)
        );

      // verify the token
      const data = await tokenService.verifyToken(token);
      if (!data) return next(new ErrorHandler("Invalid activation code", 400));

      const { name, email, password, activationCode: code } = data;

      // verify that the activationCode is valid or not
      if (parseInt(activationCode) !== parseInt(code))
        return next(new ErrorHandler("Invalid activation code", 400));

      // check, is user already exists?
      const user = await User.findOne({ email });
      if (user) return next(new ErrorHandler("user already exists", 400));

      // create user
      const newUser = await User.create({ name, email, password });

      const userPayload = {
        name: newUser.name,
        email: newUser.email,
        role: newUser?.role,
        isVerified: newUser?.isVerified,
        cources: newUser?.cources,
        _id: newUser?._id,
        createdAt: newUser?.createdAt,
        updatedAt: newUser?.updatedAt,
      };
      res.status(201).json({
        success: true,
        message: "User account activate successfully",
        user: userPayload,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
  // get all user(this for only admin)
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getUsers();
      if (users.error) return next(new ErrorHandler(users.message, 400));
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
  // login
  async login(req, res, next) {
    const { email, password } = req.body;
    try {
      // if user not enter email and password then trow error
      if (!email || !password)
        return next(new ErrorHandler("Please enter email and password", 400));

      // check is user exists?
      const user = await User.findOne({ email }).select("+password");
      if (!user)
        return next(
          new ErrorHandler("Please enter valid email and password", 400)
        );

      // now compate the password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch)
        return next(
          new ErrorHandler("Please enter valid email and password", 400)
        );
      // create token
      const {
        accessToken,
        accessTokenOptions,
        refreshToken,
        refreshTokenOptions,
      } = await tokenService.createToken({ id: user._id });

      // set accessToken and refressToken into cookie
      res.cookie("accessToken", accessToken, accessTokenOptions);
      res.cookie("refreshToken", refreshToken, refreshTokenOptions);

      // set user session in redis
      const userPayload = { ...user._doc };
      delete userPayload.password;
      await redis.set(user._id, JSON.stringify(userPayload));

      res.status(200).json({
        success: true,
        message: "login successfully",
        user: userPayload,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // logout user
  async logout(req, res, next) {
    try {
      // remove cookie
      res.cookie("accessToken", "", { maxAge: 1 });
      res.cookie("refreshToken", "", { maxAge: 1 });

      // remove user from redis cache
      const user = await redis.del(req.user._id);
      res.status(200).json({
        success: true,
        message: "User logout successfully",
      });
    } catch (error) {}
  }

  // update accessToken
  async updateAccessToken(req, res, next) {
    try {
      const { refreshToken: token } = req.cookies;
      // verify the refreshToken
      const decoded = await tokenService.verifyRefreshToken(token);
      const message = "Please login to access this resources";
      if (!decoded) return next(new ErrorHandler(message, 400));

      // check the session-> user is valid or not
      const session = await redis.get(decoded.id);
      if (!session) return next(new ErrorHandler(message, 400));

      const user = JSON.parse(session);
      // create new token
      const {
        accessToken,
        accessTokenOptions,
        refreshToken,
        refreshTokenOptions,
      } = await tokenService.createToken({ id: user._id });

      req.user = user;
      // set token in the cookie
      res.cookie("accessToken", accessToken, accessTokenOptions);
      res.cookie("refreshToken", refreshToken, refreshTokenOptions);
      
      await redis.set(user._id, JSON.stringify(user), "EX", 604800)

      res.status(200).json({
        success: true,
        token: accessToken,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // get user info
  async getUserInfo(req, res, next) {
    const userId = req.user?._id || req.user?.id;
    try {
      const user = await userService.getUserById(userId);
      if (user?.error) {
        return next(new ErrorHandler(user.message, 400));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // social authentication
  async socialAuth(req, res, next) {
    const { name, email, avatar } = req.body;
    try {
      if (!name || !email || !avatar)
        return next(new ErrorHandler("Please enter all required fields", 400));

      const user = await userService.getUser({ email });
      if (!user?.error) {
        return next(new ErrorHandler("User already exists", 400));
      }

      const newUser = await userService.create({ name, email, avatar });
      if (newUser?.error) {
        return next(new ErrorHandler(newUser.message, 400));
      }

      // create toekn
      const {
        accessToken,
        accessTokenOptions,
        refreshToken,
        refreshTokenOptions,
      } = await tokenService.createToken({ id: newUser?._id });

      // set token in the cookies
      res.cookie("accessToken", accessToken, accessTokenOptions);
      res.cookie("refreshToken", refreshToken, refreshTokenOptions);

      res.status(201).json({
        success: true,
        user: newUser,
        token: accessToken,
      });
    } catch (error) {}
  }

  // update user info
  async updateUserInfo(req, res, next) {
    const data = req.body;
    try {
      if (Object.keys(data).length <= 0)
        return next(
          new ErrorHandler("Please provide sufficient data to update user info")
        );

      if ((data?.name || data?.email) && req.user) {
        const userId = req.user._id;
        console.log(data);
        const user = await userService.update(userId, data);
        if (user.error) return next(new ErrorHandler(user.message, 500));

        // set updated data into redis
        redis.set(user._id, JSON.stringify(user));

        res.status(200).json({
          success: true,
          message: "User info update successfully",
        });
      }
    } catch (error) {}
  }

  // change password
  async changePassword(req, res, next) {
    const { oldPassword, newPassword } = req.body;
    try {
      if (!oldPassword || !newPassword)
        return next(
          new ErrorHandler("oldPassword and newPassword is required")
        );

      const user = await userService.getUser(
        { _id: req.user._id },
        "+password"
      );
      console.log(user);
      if (!user?.password)
        return next(
          new ErrorHandler("You are not able to change your password")
        );

      const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordMatch)
        return next(new ErrorHandler("Invalid old password", 400));

      // hash the new password
      const slat = await bcrypt.genSaltSync(10);
      const newHashPassword = await bcrypt.hashSync(newPassword, slat);
      const updatePassword = userService.update(user._id, {
        password: newHashPassword,
      });
      if (updatePassword.error)
        return next(new ErrorHandler(updatePassword.message));

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {}
  }

  // update user avatar
  async uploadAvatar(req, res, next) {
    try {
      const form = formidable({});
      form.parse(req, async (err, fields, files) => {
        try {
          const { avatar: image } = files;
          if (!image)
            return next(
              new ErrorHandler("Before uploading, please select an avatar")
            );

          const avatar = await userService.uploadImage(image[0], "avatars");
          if (avatar.error) return next(new ErrorHandler(avatar.message, 400));
          const userId = req?.user?._id;
          // update the avatar into the database
          const user = await userService.update(userId, { avatar });

          // store updated user into cache(redis)
          redis.set(userId, JSON.stringify(user));

          res.status(201).json({
            success: true,
            message: "user avatar uploaded successfully",
            avatar,
          });
        } catch (error) {
          console.log(error);
          return next(new ErrorHandler(error.message, 400));
        }
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // Update user role (this only for admin)
  async updateUserRole(req, res, next) {
    const { userId, role } = req.body;
    try {
      // Make sure userId and role are provided as the body data
      if (!userId || !role)
        return next(new ErrorHandler("userId and role are required", 400));

      const isUserExist = await userService.getUser({ _id: userId });
      if (isUserExist.error)
        return next(new ErrorHandler(isUserExist.message, 400));

      // update role
      const newUserRole = await userService.update(userId, { role });
      if (newUserRole.error)
        return next(new ErrorHandler(newUserRole.message, 400));

      res.status(200).json({
        success: true,
        message: `${newUserRole.name}'s role was ${isUserExist.role} now it's assigned to ${newUserRole.role}  `,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message));
    }
  }

  // delet user from the database (this only for admin)
  async deleteUser(req, res, next) {
    const { userId } = req.body;
    try {
      const isUserExist = await userService.getUser({ _id: userId });
      if (isUserExist.error)
        return next(new ErrorHandler(isUserExist.message, 400));

      // delete user
      const deleteUser = await userService.delete(userId);
      if (deleteUser.error)
        return next(new ErrorHandler(deleteUser.message, 400));

      // delet user from the cache if have
      const isCachedUser = await redis.get(userId);
      if (isCachedUser) {
        redis.del(userId);
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message));
    }
  }

  // get user analytics(this only for admin)
  async getUserAnalytics(req, res, next){
    try {
      const data = await generateLast12MonthsData(User)
      res.status(200).json({
        success:true,
        data
      })
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message));
    }
  }
}

module.exports = new UserController();
