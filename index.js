// index.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const socketIO = require("socket.io");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);
const io = socketIO(server);

app.use(cors());

const authRoutes = require("./routes/authRoutes");
const Message = require("./model/Message");

// Routes
app.use("/api/auth", authRoutes);
// app.use("/auth", require("./routes/authRoutes.js"));
// app.use("/conversations", require("./routes/conversationRoutes"));
// app.use("/messages", require("./routes/messageRoutes"));

const PORT = process.env.PORT || 5000;
const onlineUsers = {};

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) {
    console.log("User connected without userId");
    return;
  }

  onlineUsers[userId] = socket.id;
  console.log(`✅ User ${userId} connected with socket ${socket.id}`);

  // 🔁 1. Deliver undelivered messages
  try {
    const messages = await Message.find({
      receiverId: userId,
      isDelivered: false,
    });

    messages.forEach((msg) => {
      socket.emit("receive_message", msg);
    });

    await Message.updateMany(
      { receiverId: userId, isDelivered: false },
      { isDelivered: true }
    );
  } catch (err) {
    console.error("❌ Error fetching offline messages:", err.message);
  }

  socket.on("send_message", async (data) => {
    const { senderId, receiverId, content } = data;

    if (!senderId || !receiverId || !content) {
      return socket.emit("error", {
        message: "senderId, receiverId, and content are required.",
      });
    }

    try {
      const newMsg = await Message.create({
        senderId,
        receiverId,
        content,
        isDelivered: !!onlineUsers[receiverId],
      });

      if (onlineUsers[receiverId]) {
        io.to(onlineUsers[receiverId]).emit("receive_message", newMsg);
      }

      socket.emit("message_sent", newMsg);
    } catch (err) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
