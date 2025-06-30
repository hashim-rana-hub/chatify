const axios = require("axios");

const sendOtpToEmail = async (to, subject, text) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Chat App", email: process.env.SENDER_EMAIL },
        to: [{ email: to }],
        subject: subject,
        textContent: text,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
      }
    );

    console.log("✅ Email sent:", response.data.messageId || response.data);
  } catch (err) {
    console.error("❌ Brevo email error:", err.response?.data || err.message);
    throw err;
  }
};

module.exports = sendOtpToEmail;
