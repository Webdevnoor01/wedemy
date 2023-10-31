const jwt = require("jsonwebtoken");

class TokenService {
  // create activaiton token
  async createActivationToken(data) {
    const activationCode = (
      Math.floor(Math.random() * 10000) + 1000
    ).toString();
    try {
      const token = await jwt.sign(
        { ...data, activationCode },
        process.env.JWT_SECRET,
        {
          expiresIn: "5m",
        }
      );

      return { token, activationCode };
    } catch (error) {
      console.log("token error: ", error);
    }
  }

  // create token for login, it includes accessToken and refreshToken
  async createToken(data) {
    try {
      // getting accessToken secret and refreshToken secret from the env
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "";
      const refreshTokenSecret = process.env.REFRESS_TOKEN_SECRET || "";

      // getting accessToken secret and refreshToken expire time from the env
      const accessTokenExpire = parseInt(
        process.env.ACCESS_TOKEN_EXPIRE || "300",
        10
      );
      const refreshTokenExpire = parseInt(
        process.env.REFRESS_TOKEN_EXPIRE || "300",
        10
      );

      // create accessToken
      const accessToken = await jwt.sign(data, accessTokenSecret, {
        expiresIn: "5m",
      });
      const accessTokenOptions = {
        expires: new Date(Date.now() + accessTokenExpire* 60 * 1000),
        maxAge: accessTokenExpire  * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
      };

      // create secret token
      const refreshToken = await jwt.sign(data, refreshTokenSecret, {
        expiresIn: "3d",
      });
      const refreshTokenOptions = {
        expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
        maxAge: refreshTokenExpire * 24 * 60 *60 * 1000,
        httpOnly: true,
        sameSite: "lax",
      };

      if (process.env.NODE_ENV === "production") {
        accessTokenOptions.secure = true;
        refreshTokenOptions.secure = true;
      }

      return {
        accessToken,
        accessTokenOptions,
        refreshToken,
        refreshTokenOptions,
      };
    } catch (error) {
      console.log("token-error: ", error);
      throw new Error(error.message);
    }
  }
  // verify access token
  async verifyAccessToken(token) {
    const data = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return data;
  }
  // verify refress token
  async verifyRefreshToken(token) {
    const data = await jwt.verify(token, process.env.REFRESS_TOKEN_SECRET);
    return data;
  }
  // verify token
  async verifyToken(token) {
    try {
      const data = await jwt.verify(token, process.env.JWT_SECRET);

      return data;
    } catch (error) {
      console.log("token error: ", error);
    }
  }
}

module.exports = new TokenService();
