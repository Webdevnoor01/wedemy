const {Redis} = require("ioredis")

const redisClint =() => {
    if(process.env.REDIS_URL){
        console.log("redis connected")
        return process.env.REDIS_URL
    }
}

 const redis = new Redis(redisClint())

module.exports = {redis}