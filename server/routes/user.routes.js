const userRouter = require("express").Router()
const userController = require("../controller/user.controller")

// register user
userRouter.post("/auth/register", userController.register)
userRouter.post("/auth/activation", userController.activateUser)
userRouter.post("/auth/login", userController.login)


module.exports = userRouter