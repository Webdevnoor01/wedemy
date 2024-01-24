const ErrorHandler = require("../utils/errorHandler");
const ejs = require("ejs");
const path = require("path");

// services
const mailService = require("../service/mail.service");
const courseService = require("../service/course.service");
const userService = require("../service/user.service");
const orderService = require("../service/order.service");
const notificationService = require("../service/notification.service");
const { redis } = require("../utils/redis");

// utils
const generateLast12MonthsData = require("../utils/analytic.generator");
// models
const orderModel = require("../models/order.model");
class OrderController {
  // create order
  async create(req, res, next) {
    const courseId = req.params.courseId;
    const userId = req.user?._id;
    try {
      //  make sure, is user exist
      const user = await userService.getUser({ _id: userId });
      if (user.error) return next(new ErrorHandler(user.message, 400));

      // is course exist
      const course = await courseService.findById(courseId);
      if (course.error) return next(new ErrorHandler(course.message, 400));

      // check that user already purchesed the course
      const isCourseExistInUser = user.courses?.find(
        (course) => course.id === courseId
      );
      if (isCourseExistInUser)
        return next(
          new ErrorHandler("You have already purchased this course", 400)
        );

      // create order
      const orderPayload = {
        userId,
        courseId,
        paymentInfo: req.body?.paymentInfo,
      };

      const newOrder = await orderService.create(orderPayload);
      if (newOrder.error) return next(new ErrorHandler(newOrder.message, 400));

      // update course purchased
      await courseService.update(courseId, {
        purchased: course.purchased + 1,
      });
      // update user courselist
      const userCourseUpdate = await userService.update(userId, {
        $push: { courses: { id: courseId } },
      });
      // send mail to the user
      const mailData = {
        data: {
          user: user.name,
          id: course._id,
          courseName: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      console.log(mailData);
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/course-confirmation-mail.ejs"),
        mailData
      );

      try {
        await mailService.send(
          req?.user?.email,
          "Order confirmation",
          "course-confirmation-mail.ejs",
          mailData
        );
      } catch (error) {
        console.log(error);
        return next(new ErrorHandler(error.message, 400));
      }

      // create notification
      const notificationPayload = {
        title: "New Order",
        message: `You have new order form ${course.name}`,
        user: {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      };

      if (userCourseUpdate.error)
        return next(new ErrorHandler(userCourseUpdate.message));
      const newNotification = await notificationService.create(
        notificationPayload
      );
      if (newNotification.error)
        return next(new ErrorHandler(newNotification.message, 400));

      // set all courses into cache
      const allCourses = await courseService.find();
      redis.set("allCourses", JSON.stringify(allCourses));

      // send the response
      res.status(201).json({
        success: true,
        message: "You course have been purchasce successfully",
        course,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // get all order(this for only admin)
  async getAllOrders(_req, res, next) {
    try {
      const orders = await orderService.getOrders();
      if (orders.error) return next(new ErrorHandler(orders.message, 400));
      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400))
    }
  }

  // get last 12 month data of order analytich(this for only admin)
  async getOrderAnalytics(req, res, next){
    try {
      const orderData = await generateLast12MonthsData(orderModel)
      res.status(200).json({
        success:true,
        data:orderData
      })
    } catch (error) {
      return next(new ErrorHandler(error.message))
    }
  }
}

module.exports = new OrderController();
