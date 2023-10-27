const mongoose = require("mongoose")
const { createClient } = require("redis")
class InitiateDB {
    connect(uri) {
        return mongoose.connect(uri)
    }
}

module.exports = new InitiateDB()