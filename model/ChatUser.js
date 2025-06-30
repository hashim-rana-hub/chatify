const mongoose = require("mongoose");

const chatUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: "" },
  status: { type: String, default: "offline" },
  timeStamp: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("ChatUser", chatUserSchema);
