const express = require("express");
const router = express.Router();
const {
  sendStripeKey,
  sendRazorpayKey,
  captureRazorpayPayment,
  captureStripePayment,
} = require("../controllers/paymentController");
const { isLoggedIn, isAdmin } = require("../middlewares/user");

// stripe payment routes
router.route("/stripekey").get(isLoggedIn, sendStripeKey);
router.route("/capturestripe").post(isLoggedIn, captureStripePayment);

// razorpay payment routes
router.route("/razorpaykey").get(isLoggedIn, sendRazorpayKey);
router.route("/capturerazorpay").post(isLoggedIn, captureRazorpayPayment);

module.exports = router;
