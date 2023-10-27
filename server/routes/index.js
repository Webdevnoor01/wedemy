const router = require("express").Router()
const userRoutes = require("./user.routes")

router.use("/api/v1", userRoutes)

module.exports = router