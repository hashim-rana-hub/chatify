const io = require("socket.io-client");

const socket = io("http://localhost:5000", {
  query: { userId: "userB" }, // this should match your DB user _id
});

socket.on("connect", () => {
  console.log("✅ Connected as userB");

  // Send message to userB
  socket.emit("send_message", {
    senderId: "userB",
    receiverId: "userA",
    content: "Hello from userB to userA!",
  });
});

// Message received from someone else
socket.on("receive_message", (msg) => {
  console.log("📩 Received:", msg);
});

// Confirm message was saved
socket.on("message_sent", (msg) => {
  console.log("✅ Message stored:", msg);
});

// Error handler
socket.on("error", (err) => {
  console.log("❌ Error:", err);
});
