const orderRouter = require("express").Router();

// middleware
const authMiddleware = require("../middleware/authentication");

// controller
const orderController = require("../controller/order.controller");

orderRouter.post(
  "/create/:courseId",
  authMiddleware.isAuthenticated,
  orderController.create
);

orderRouter.get(
  "/get",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRole("admin"),
  orderController.getAllOrders
);

module.exports = orderRouter;
