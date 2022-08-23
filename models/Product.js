const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a product name"],
    trim: true,
    maxlength: [120, "Product name should not be more than 120 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please provide a price for the product"],
    maxlength: [5, "Product price should not be more than 5 digits"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description for the product"],
  },
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please provide a category to the product"],
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
      message:
        "Please select the category from the given options ie from the enum values only ",
    },
  },
  brand: {
    type: String,
    required: [true, "Please add a brand name to the product"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// name
// price
// description
// photo[ ]
// category
// brand
// stock
// ratings
// total no of reviews
// reviews [ user , name , rating , comment ]
// user : who added this product
// createdAt

module.exports = mongoose.model("Product", productSchema);
