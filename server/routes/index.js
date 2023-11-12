const router = require("express").Router()
const userRoutes = require("./user.routes")
const courseRoutes = require("./course.routes")

router.use("/api/v1", userRoutes)

// course routes
router.use("/api/v1/course",courseRoutes)

module.exports = router