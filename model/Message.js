const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    senderId: String,
    receiverId: String,
    content: String,
    isDelivered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
