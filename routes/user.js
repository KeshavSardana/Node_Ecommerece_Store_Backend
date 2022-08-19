const express = require("express");
const {
  signup,
  login,
  logout,
  forgotpassword,
  passwordReset,
  getLoggedinUserDetails,
  changePassword,
  updateUserDetails,
  adminGetAllUsers,
  managerGetAllUsers,
  adminGetOneUser,
  adminUpdateOneUserDetails,
  adminDeleteOneUser,
} = require("../controllers/userController");
const { isLoggedIn, isAdmin, isManager } = require("../middlewares/user");
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotpassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/user/dashboard").get(isLoggedIn, getLoggedinUserDetails);
router.route("/user/password/update").post(isLoggedIn, changePassword);
router.route("/user/dashboard/update").post(isLoggedIn, updateUserDetails);

// admin routes
router.route("/admin/allusers").get(isLoggedIn, isAdmin, adminGetAllUsers);
router
  .route("/admin/user/:id")
  .get(isLoggedIn, isAdmin, adminGetOneUser)
  .put(isLoggedIn, isAdmin, adminUpdateOneUserDetails)
  .delete(isLoggedIn, isAdmin, adminDeleteOneUser);

// manager routes
router
  .route("/manager/allusers")
  .get(isLoggedIn, isManager, managerGetAllUsers);

module.exports = router;
