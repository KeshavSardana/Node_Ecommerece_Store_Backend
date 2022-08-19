const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name "],
    maxlength: [40, "name should be under 40 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    validate: [validator.isEmail, "Please provide email in correct format"],
  },
  password: {
    type: String,
    required: [true, "Please provide a valid password"],
    minlength: [6, "Password should be of atleast 6 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "subadmin", "admin", "manager"],
  },
  photo: {
    id: String,
    secure_url: String,
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// encrypt password before save - HOOKS
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// validate the user passed password with the database password
userSchema.methods.isPasswordCorrect = async function (passwordSentByUser) {
  return await bcrypt.compare(passwordSentByUser, this.password);
};

// create JWT tokens
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// generate forgot password token (string)
userSchema.methods.getForgotPasswordToken = function () {
  // generate a long and a random string
  const forgotToken = crypto.randomBytes(20).toString("hex");

  // storing the hash version of it in backend but we will send that forgotToken random string to user , so at confirming time use hash again
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  // time of token
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000; // ie 20 mins expiry

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
