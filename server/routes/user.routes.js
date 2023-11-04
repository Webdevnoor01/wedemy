const userRouter = require("express").Router()
// controller
const userController = require("../controller/user.controller")
// controller middleware
const authMiddleware = require("../middleware/authentication")
// register user
userRouter.post("/auth/register", userController.register)
userRouter.post("/auth/activation", userController.activateUser)
userRouter.post("/auth/login", userController.login)
userRouter.get("/auth/logout", authMiddleware.isAuthenticated, authMiddleware.authorizeRole(["admin","user"]), userController.logout)
userRouter.get("/auth/refresh", userController.updateAccessToken)
userRouter.get("/me",authMiddleware.isAuthenticated, userController.getUserInfo)
userRouter.post("/auth/social", userController.socialAuth)
userRouter.patch("/update-user", authMiddleware.isAuthenticated, userController.updateUserInfo)
userRouter.patch("/change-password", authMiddleware.isAuthenticated, userController.changePassword)
userRouter.patch("/upload-avatar", authMiddleware.isAuthenticated, userController.uploadAvatar)


module.exports = userRouter