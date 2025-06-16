const express = require("express");
const {
  register,
  login,
  logout,
  sendverifyOTP,
  verifyEmail,
} = require("../controller/authController");
const userAuth = require("../middleware/userAuth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-verify-otp", userAuth, sendverifyOTP);
router.post("/verify-account", userAuth, verifyEmail);

module.exports = { router };
