const ErrorHandler = require("../utils/errorHandler");
const ejs = require("ejs");
const path = require("path");
const bcrypt = require("bcryptjs");

// cash database
const { redis } = require("../utils/redis");
// model
const User = require("../models/user.model");
// services
const hashService = require("../service/hash.service");
const tokenService = require("../service/token.service");
const mailService = require("../service/mail.service");
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
        refressToken,
        refressTokenOptions,
      } = await tokenService.createToken({ id: user._id });

      // set accessToken and refressToken into cookie
      res.cookie("accessToken", accessToken, accessTokenOptions);
      res.cookie("refressToken", refressToken, refressTokenOptions);

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
    }
  }

  // logout user
  async logout(req, res, next) {
    try {
      // remove cookie
      res.cookie("accessToken", "", { maxAge: 1 });
      res.cookie("refreshToken", "", { maxAge: 1 });

      res.status(200).json({
        success: true,
        message: "User logout successfully",
      });
    } catch (error) {}
  }
}

module.exports = new UserController();
