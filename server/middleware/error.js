const ErrorHandler = require("../utils/errorHandler")

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode ||500
    err.message = err.message || "Internal server error"
    // mongodb wrong id error
    if(err.name === "CastError"){
        const message = `resource not found. Invalid:${err.path} `
        err = new ErrorHandler(message, 400)
    }
    // Duplicate key error
    if(err.statusCode === 11000){
        const message = `Duplicate key ${Object.keys(err.keyValue)} entered `
        err = new ErrorHandler(message, 400)

    }
    // wrong jwt error
    if(err.name === "JsonWebTokenError" ){
        const message = `jwt is invalid. please try again `
        err = new ErrorHandler(message, 400)

    }
    // jwt token expired
    if(err.name === "TokenExpiredError" ){
        const message = `jwt is expired. please try again `
        err = new ErrorHandler(message, 400)

    }

    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}