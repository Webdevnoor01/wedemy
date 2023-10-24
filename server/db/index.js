const mongoose = require("mongoose")
const { createClient } = require("redis")
class InitiateDB {
    connect(uri) {
        return mongoose.connect(uri)
    }

    connectRedis(url){
        const clint = createClient({
            url
        })
        clint.on("error", (err) => {
            throw new Error(err)
        })

        clint.connect().then((param) => {
            console.log("redis database connected successfully")
        }).catch((err) => {
            console.log("failed to connect redis")
        })
    }
}

module.exports = new InitiateDB()