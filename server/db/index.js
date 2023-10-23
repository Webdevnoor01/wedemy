const mongoose = require("mongoose")
class InitiateDB {
    connect(uri) {
        return mongoose.connect(uri)
    }
}

module.exports = new InitiateDB()