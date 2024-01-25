const layoutRouter = require("express").Router();

// middleware
const authMiddleware = require("../middleware/authentication");
// controller
const layoutController = require("../controller/layout.controller");

layoutRouter.post(
  "/create",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRole("admin"),
  layoutController.create
);

module.exports = layoutRouter;
