const jwt = require("jsonwebtoken");

class TokenService {
  // create activaiton token
  async createActivationToken(data) {
    const activationCode = (Math.floor(Math.random() * 10000) + 1000).toString();
    try {
      const token = await jwt.sign({...data, activationCode}, process.env.JWT_SECRET, {
        expiresIn: "5m",
      });

      return { token, activationCode };
    } catch (error) {
      console.log("token error: ", error);
    }
  }

  // create token for login, it includes accessToken and refressToken
  async createToken(data){
    try {
      // getting accessToken secret and refressToken secret from the env
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || ""
      const refressTokenSecret = process.env.REFRESS_TOKEN_SECRET || ""
      
      // getting accessToken secret and refressToken expire time from the env
      const accessTokenExpire =parseInt(process.env.ACCESS_TOKEN_EXPIRE ||"300",10)  
      const refressTokenExpire = parseInt(process.env.REFRESS_TOKEN_EXPIRE ||"300",10)

      // create accessToken
      const accessToken = await jwt.sign(data, accessTokenSecret, {
        expiresIn:accessTokenExpire *1000
      })
      const accessTokenOptions = {
        expires:new Date(Date.now() + accessTokenExpire *1000),
        maxAge:accessTokenExpire *1000,
        httpOnly:true,
        sameSite:"lax"
      }
      
      // create secret token
      const refressToken = await jwt.sign(data, refressTokenSecret, {
        expiresIn:refressTokenExpire * 1000
      })
      const refressTokenOptions = {
        expires:new Date(Date.now() + refressTokenExpire *1000),
        maxAge:refressTokenExpire *1000,
        httpOnly:true,
        sameSite:"lax"
      }

      if(process.env.NODE_ENV === "production"){
        accessTokenOptions.secure = true
        refressTokenOptions.secure = true
      }

      return {
        accessToken, accessTokenOptions, refressToken, refressTokenOptions
      }
    } catch (error) {
      console.log("token-error: ", error)
      throw new Error(error.message)
    }
  }

  // verify token 
  async verifyToken(token) {
    try {
      const data = await jwt.verify(token,process.env.JWT_SECRET);

      return data;
    } catch (error) {
      console.log("token error: ", error);
    }
  }
}

module.exports = new TokenService();
