const jwt = require("jsonwebtoken");
const User = require("../models/User");
const BigPromise = require("./bigPromise");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  const token = req.cookies.token || req.header("Authorization");
  // console.log(token);

  if (!token) {
    return next(new Error("Please Login first to get access of this page"));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  user.password = undefined;

  if (!user) {
    return next(new Error("Token validation is invalid , please login again"));
  }

  // populate the request with the user details in this middleware and then you can access to this user via req.user anywhere
  req.user = user;
  next();
});

exports.isAdmin = BigPromise(async (req, res, next) => {
  userId = req.user._id;
  const user = await User.findById(userId);
  if (user.role == "user") {
    return next(new Error("You dont have access to this Page"));
  }
  if (user.role == "manager") {
    return next(new Error("You dont have access to this Page"));
  }

  if (user.role == "admin") {
    next();
  }
});

exports.isManager = BigPromise(async (req, res, next) => {
  userId = req.user._id;
  const user = await User.findById(userId);
  if (user.role == "user") {
    return next(new Error("You dont have access to this Page"));
  }
  if (user.role == "manager") {
    next();
  }
  if (user.role == "admin") {
    next();
  }
});
