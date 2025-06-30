const validator = require("validator");

const registerChatUserValidator = ({ email, password }) => {
  const errors = {};

  if (!email || !validator.isEmail(email)) {
    errors.email = "Invalid email address";
  }

  if (!password || !validator.isLength(password, { min: 6 })) {
    errors.password = "Password must be at least 6 characters";
  }

  const isValid = Object.keys(errors).length === 0;

  return { isValid, errors };
};

module.exports = { registerChatUserValidator };
