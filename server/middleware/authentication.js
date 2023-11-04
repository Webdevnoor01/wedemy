const ErrorHandler = require("../utils/errorHandler");
const tokenService = require("../service/token.service");

// redis
const { redis } = require("../utils/redis");
class Authentication {
  async isAuthenticated(req, _, next) {
    const { accessToken } = req.cookies;
    try {
      if (!accessToken)
        return next(new ErrorHandler("Unauthorized access"), 400);
      // verify token
      const decode = await tokenService.verifyAccessToken(accessToken);
      if (!decode) return next(new ErrorHandler("Invalid token"));
      // ger user from cache
      const data = await redis.get(decode.id);
      const user = JSON.parse(data)
      if (!user) return next(new ErrorHandler("user not found", 400));
      req.user =user
      next();
    } catch (error) {
      console.log(error)
      return next(new ErrorHandler(error.message), 400);
    }
  }

  authorizeRole(userRole) {
    return (req, _, next) => {
      const role = req?.user?.role || "";
      if (!userRole.includes(role))
        return next(new ErrorHandler("Unauthorized access"));
      next();
    };
  }
}

module.exports = new Authentication();
