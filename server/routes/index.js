const router = require("express").Router()
const userRoutes = require("./user.routes")
const courseRoutes = require("./course.routes")
const orderRoutes = require("./order.routes")

router.use("/api/v1", userRoutes)

// course routes
router.use("/api/v1/course",courseRoutes)

// order routes
router.use("/api/v1/order", orderRoutes)

module.exports = router