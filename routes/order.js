const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOneOrder,
  allOrdersOfLoggedInUser,
  adminGetAllOrders,
  adminGetOneOrder,
  adminDeleteOneOrder,
} = require("../controllers/orderController");
const { isLoggedIn, isAdmin } = require("../middlewares/user");

// user routes
router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/myorders").get(isLoggedIn, allOrdersOfLoggedInUser);
router.route("/order/:id").get(isLoggedIn, getOneOrder);

// admin routes
router.route("/admin/orders").get(isLoggedIn, isAdmin, adminGetAllOrders);
router.route("/admin/order/:id").get(isLoggedIn, isAdmin, adminGetOneOrder);
router
  .route("/admin/order/delete/:id")
  .delete(isLoggedIn, isAdmin, adminDeleteOneOrder);

module.exports = router;
