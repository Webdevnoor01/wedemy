const notificationRouter = require("express").Router();

// middleware
const authMiddleware = require("../middleware/authentication");

// controller
const notificationController = require("../controller/notification.controller");

// routes
notificationRouter.get(
  "/get",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRole("admin"),
  notificationController.getAllNotification
);
notificationRouter.get(
  "/update/status/:notificationId",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRole("admin"),
  notificationController.updateNotificationStatus
);
module.exports = notificationRouter;
