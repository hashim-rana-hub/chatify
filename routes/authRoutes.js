const express = require("express");
const router = express.Router();
const {
  sendOtp,
  createUser,
  chatUserLogin,
} = require("../controller/authController");

router.post("/send-otp", sendOtp);
router.post("/chat-user", createUser);
router.post("/chat-user-login", chatUserLogin);

// router.post("/verify-otp", verifyOtp);

module.exports = router;
