const express = require("express");
const router = express.Router();

const {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
} = require("../controller/AuthController");

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refreshToken", refreshTokenController);
router.post("/logout", logoutController);
router.get("/testVerify", (req, res) => {
  res.json({ data: [{ username: "nhatnm1" }, { username: "nhatnm2" }] });
});

module.exports = router;
