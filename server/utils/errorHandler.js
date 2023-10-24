class ErrorHandler extends Error {
    constructor(message, statusCode){
        this.message = message
        this.statusCode = statusCode
        Error.captureStackTrace(this, this.statusCode)
    }
}

module.exports = ErrorHandler