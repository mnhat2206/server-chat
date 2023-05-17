const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const verifyAuthenToken = (req, res, next) => {
  // path not verify token
  const nonSecurePaths = ["/register", "/login", "/refreshToken"];
  if (nonSecurePaths.includes(req.path)) {
    return next();
  }
  // verify token after response
  const authorizationHeader = req.headers.authorization;
  const accessToken = authorizationHeader?.split(" ")[1];
  if (accessToken === "undefined") {
    return res.status(401).json(createError.Unauthorized());
  }

  jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, data) => {
    if (err) {
      // return res.status(403).json(createError.Forbidden());
      return res.status(403).json({ message: err });
    }
    return next();
  });
};

module.exports = verifyAuthenToken;
