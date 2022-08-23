const express = require("express");
const {
  addProduct,
  getAllProduct,
  addReview,
  deleteReview,
  getOnlyReviewsForOneProduct,
  adminGetAllProducts,
  getSingleProduct,
  adminUpdateOneProduct,
  adminDeleteOneProduct,
} = require("../controllers/productController");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middlewares/user");

// user routes
router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getSingleProduct);
router.route("/review").put(isLoggedIn, addReview);
router.route("/review").delete(isLoggedIn, deleteReview);
router.route("/reviews").get(isLoggedIn, getOnlyReviewsForOneProduct);

// admin routes
router.route("/admin/product/add").post(isLoggedIn, isAdmin, addProduct);
router.route("/admin/products").get(isLoggedIn, isAdmin, adminGetAllProducts);
router
  .route("/admin/product/:id")
  .put(isLoggedIn, isAdmin, adminUpdateOneProduct)
  .delete(isLoggedIn, isAdmin, adminDeleteOneProduct);

module.exports = router;
