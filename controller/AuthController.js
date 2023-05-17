const jwt = require("jsonwebtoken");
const jwtDecode = require("jwt-decode");
const createError = require("http-errors");

const UserModel = require("../model/User");

const registerController = async (req, res) => {
  const data = req.body;
  try {
    if (Object.keys(data).length !== 0) {
      await UserModel.create(data);
      return res.json({ message: "Register successfully" });
    } else {
      return res.status(403).json(createError.Forbidden());
    }
  } catch (error) {
    if (error) return res.status(501).json(createError.NotImplemented());
  }
};

const loginController = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await UserModel.findOne({ username, password });
    if (!result) {
      return res
        .status(403)
        .json(createError(403, "Incorrect account or password"));
    } else {
      const accessToken = jwt.sign(
        { userId: result._id, username },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "30day",
        }
      );
      const refreshToken = jwt.sign(
        { userId: result._id, username },
        process.env.JWT_SECRET_REFRESH_KEY,
        { expiresIn: "30day" }
      );
      await UserModel.findByIdAndUpdate({ _id: result._id }, { refreshToken });
      res.cookie("accessToken", accessToken, {
        secure: true,
        sameSite: true,
      });
      res.cookie("refreshToken", refreshToken, {
        secure: true,
        sameSite: true,
      });
      return res.json({ message: "Login successfully" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const refreshTokenController = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) res.status(401).json(createError.Unauthorized());
  const { username } = jwtDecode(refreshToken);
  const result = await UserModel.findOne({ username });
  if (!result) {
    res.status(403).json(createError.Forbidden());
  } else {
    if (refreshToken === result.refreshToken) {
      jwt.verify(
        refreshToken,
        process.env.JWT_SECRET_REFRESH_KEY,
        (err, data) => {
          if (err) res.status(403).json(createError(err));
          const newAccessToken = jwt.sign(
            { username: data.username },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "1h",
            }
          );
          res.cookie("accessToken", JSON.stringify(newAccessToken), {
            secure: true,
            sameSite: true,
          });
          res.status(201).json({ message: "Refresh Token Successfully" });
        }
      );
    } else {
      res.status(403).json(createError.Forbidden());
    }
  }
};

const logoutController = (req, res) => {
  console.log("[clear token]");
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.end();
};

module.exports = {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
};
