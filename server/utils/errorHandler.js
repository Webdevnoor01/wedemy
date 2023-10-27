class ErrorHandler extends Error {
    constructor(message, statusCode, res){
        super(message)
        this.message = message
        this.statusCode = statusCode
        this.res = res
        Error.captureStackTrace(this, this.statusCode)
    }
    send(){
        this.res.status(this.statusCode).json({
            success:false,
            message: this.message
        })
    }

}

module.exports = ErrorHandler