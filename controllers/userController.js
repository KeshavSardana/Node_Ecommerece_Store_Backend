const BigPromise = require("../middlewares/bigPromise");
const User = require("../models/User");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");
const bcrypt = require("bcryptjs");
const mailHelper = require("../utills/mailHelper");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name) {
    return next(new Error("Name is required "));
  }

  if (!email) {
    return next(new Error("Email is required "));
  }

  if (!password) {
    return next(new Error("Password is required "));
  }

  const existingUser = await User.findOne({ email }); // RETURNS  PROMISE
  if (existingUser) {
    return next(new Error("User Already Exists !!"));
  }

  // lets take the photo first
  let result;
  if (req.files) {
    let file = req.files.photo;
    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 500,
      crop: "scale",
    });
  }

  let user;
  if (req.files) {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      photo: {
        id: result.public_id,
        secure_url: result.secure_url,
      },
    });
  } else {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });
  }

  // signup done now get the token
  // we can use our utils code of cookieToken aswell to generate the token . we just wrote these this code only but as a function to reuse.
  const token = user.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  user.password = undefined;

  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  // check for presence of email and password
  if (!email) {
    return next(new Error("Please provide your Email"));
  }
  if (!password) {
    return next(new Error("Please provide the password"));
  }

  // check if the user account exists or not in DB
  const existingUser = await User.findOne({ email }).select("+password");

  // if user not found in DB
  if (!existingUser) {
    return next(new Error("Account does not Exist ! please signup first"));
  }

  // match the password
  let passwordCheck = await existingUser.isPasswordCorrect(password);
  console.log("PASSWORD CHECK LOG: ", passwordCheck);

  // if password do not match
  if (!passwordCheck) {
    return next(new Error("Password is incorrect"));
  }

  // if everything goes right , send the token in the  cookie
  const token = existingUser.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  existingUser.password = undefined;

  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
    existingUser,
  });
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout success",
  });
});

exports.forgotpassword = BigPromise(async (req, res, next) => {
  // collect email
  const { email } = req.body;

  // check for email
  if (!email) {
    return next(new Error("Please provide an email"));
  }

  // check for user in DB
  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("Account does not exists "));
  }

  // get the forgot password token from user model
  const forgotToken = await user.getForgotPasswordToken();

  // save user fields in DB
  await user.save({ validateBeforeSave: false });

  // create a url
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  // craft a message
  const message = `Copy Paste this link in the browser and hit enter \n \n ${myUrl}`;

  // use try catch because chances are high of getting errors in sending mail
  try {
    await mailHelper({
      email: user.email,
      subject: "LCO Tstore - Password Reset Link",
      message,
    });

    // json response if the mail is sent successfully
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    // reset user fields if things goes wrong
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    // send error message
    return next(new Error(error.message));
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const tokenn = req.params.token;

  const encryToken = crypto.createHash("sha256").update(tokenn).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new Error("Token is invalid or expired"));
  }

  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return next(new Error("Password and confirm Password does not match"));
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  const userWithUpdatedPassword = await user.save();

  // now password changed successfully and hance return a token or json response however you wanna go further.
  const token = user.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // user.password = undefined;
  userWithUpdatedPassword.password = undefined;

  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
    userWithUpdatedPassword,
  });
});

exports.getLoggedinUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  // user.password = undefined;
  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  // extract all the fields from the frontend
  const { oldPassword, newPassword, confirmPassword } = req.body;

  // check if the new and confirm password even matches or not
  if (newPassword !== confirmPassword) {
    return next(new Error("New Password and confirm Password does not match."));
  }

  // check if the old password is even correct or not
  const userId = req.user._id;
  const user = await User.findById(userId).select("+password");
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    return next(new Error("Old Password is incorrect"));
  }

  user.password = newPassword;
  const updatedUserPassword = await user.save();

  // return the cookie token again as info got changed now.
  const token = updatedUserPassword.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  updatedUserPassword.password = undefined;

  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
    updatedUserPassword,
  });
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  const name = req.body.name;
  const newData = {
    name,
    email: req.user.email,
  };
  const user = await User.findByIdAndUpdate(req.user._id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });

  res.status(200).json({ success: true });
});

exports.adminGetAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
  // console.log(req.params.id);
  const user = await User.findById(req.params.id);
  // console.log(user);
  if (!user) {
    return next(new Error("User does not exist"));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {
  const newData = {
    name: req.body.name || req.user.name,
    email: req.body.email || req.user.email,
    password: req.body.password,
    role: req.body.role || req.user.role,
  };
  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });

  res.status(200).json({ success: true, user });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new Error("No such user found"));
  }
  const imageId = user.photo ? user.photo.id : "";
  if (imageId) {
    await cloudinary.v2.uploader.destroy(imageId);
  }
  await user.remove();

  res.status(200).json({ success: true });
});

exports.managerGetAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: { $ne: "admin" } });
  res.status(200).json({
    success: true,
    users,
  });
});
