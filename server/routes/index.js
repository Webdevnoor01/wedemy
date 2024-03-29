const router = require("express").Router()
const userRoutes = require("./user.routes")
const courseRoutes = require("./course.routes")
const orderRoutes = require("./order.routes")
const notificationRoutes = require("./notification.routes")
const layoutRoutes = require("./layout.routes")

router.use("/api/v1", userRoutes)

// course routes
router.use("/api/v1/course",courseRoutes)

// order routes
router.use("/api/v1/order", orderRoutes)

// notification routes
router.use("/api/v1/notification", notificationRoutes)

// layout routes
router.use("/api/v1/layout", layoutRoutes)

module.exports = router