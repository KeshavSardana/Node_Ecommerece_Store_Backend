// i actually have just pasted these c4 controllers because it was just getting too much for me right now and my priority is now to end this course
// so copied these 4 controllers :-   getAllProduct , addReview , deleteReview , getOnlyReviewsForOneProduct
// and also copied this pagination filteration pages ie WhereClause Utility

const BigPromise = require("../middlewares/bigPromise");
const Product = require("../models/Product");
const cloudinary = require("cloudinary");
const WhereClause = require("../utills/whereClause");

exports.addProduct = BigPromise(async (req, res, next) => {
  let imageArray = [];

  if (!req.body.name) {
    return next("Please provide a name to create a product");
  }

  if (!req.body.price) {
    return next("Please provide a price to create a product");
  }

  if (!req.body.description) {
    return next("Please provide a description to create a product");
  }

  if (!req.body.category) {
    return next("Please provide a category to create a product");
  }

  if (!req.body.brand) {
    return next("Please provide a brand to create a product");
  }

  if (!req.files) {
    return next(new Error("photos are required to create a product"));
  }

  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imageArray;
  req.body.user = req.user;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

// i am remaining with get all products for home page for a user and in that he can use filter search pagination etc

exports.getSingleProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new Error("No product found with this id"));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

exports.getAllProduct = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const totalcountProduct = await Product.countDocuments();

  const productsObj = new WhereClause(Product.find(), req.query)
    .search()
    .filter();

  let products = await productsObj.base;
  const filteredProductNumber = products.length;

  //products.limit().skip()

  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalcountProduct,
  });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const AlreadyReview = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (AlreadyReview) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  // adjust ratings

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //save

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await Product.findById(productId);

  const reviews = product.reviews.filter(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  const numberOfReviews = reviews.length;

  // adjust ratings

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  //update the product

  await Product.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getOnlyReviewsForOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// admin only controllers

exports.adminGetAllProducts = BigPromise(async (req, res, next) => {
  const products = await Product.find({});

  res.status(200).json({
    success: true,
    products,
  });
});

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new Error("No product found with this id"));
  }

  let imagesArray = [];

  if (!req.body.name) {
    return next("Please provide a name to create a product");
  }

  if (!req.body.price) {
    return next("Please provide a price to create a product");
  }

  if (!req.body.description) {
    return next("Please provide a description to create a product");
  }

  if (!req.body.category) {
    return next("Please provide a category to create a product");
  }

  if (!req.body.brand) {
    return next("Please provide a brand to create a product");
  }

  if (req.files) {
    // destroy the old images from cloudinary

    for (let index = 0; index < product.photos.length; index++) {
      const res = await cloudinary.v2.uploader.destroy(
        product.photos[index].id
      );
    }
    // upload new images in cloudinary

    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        {
          folder: "products",
        }
      );

      imagesArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imagesArray;
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new Error("No product found with this id"));
  }

  for (let index = 0; index < product.photos.length; index++) {
    const res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
  }

  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product was deleted ",
    deletedProduct,
  });
});
