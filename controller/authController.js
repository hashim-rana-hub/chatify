const ChatUser = require("../model/ChatUser");
const User = require("../model/User");
const sendOtpToEmail = require("../utils/sendOtpToEmail");
const { registerChatUserValidator } = require("../validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const secretKey = process.env.JWT;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  try {
    await User.findOneAndUpdate(
      { email },
      { email, otp, otpExpiresAt },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    });

    return res.status(200).json({
      message: "OTP sent to your email",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error while sending OTP",
      error: err.message,
    });
  }
};

const createUser = async (req, res) => {
  const { email, password, name, avatar } = req.body;
  const { isValid, errors } = registerChatUserValidator(req.body);

  if (!isValid) {
    return res.status(400).json({ message: "Validation failed", errors });
  }
  try {
    const existing = await ChatUser.findOne({ $or: [{ email }, { name }] });
    if (existing) {
      const field = existing.email === email ? "Email" : "name";
      return res.status(400).json({ message: `${field} already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await ChatUser.create({
      email,
      password: hashedPassword,
      name,
      avatar,
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const chatUserLogin = async (req, res) => {
  const { email, password } = req.body;
  const { isValid, errors } = registerChatUserValidator(req.body);
  if (!isValid) {
    return res.status(422).json({
      message: "Something went wrong ",
      error: errors,
    });
  }

  try {
    const user = await ChatUser.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const hashedPassword = await bcrypt.compare(password, user.password);
    if (!hashedPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "24h",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = { sendOtp, createUser, chatUserLogin };
