const router = require("express").Router()


router.get("/health", (req, res) => {
    res.status(200).json({
        message:"Ok"
    })
})

router.use(require("../routes/index"))

module.exports = router