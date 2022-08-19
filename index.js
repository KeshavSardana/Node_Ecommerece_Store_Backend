const app = require("./app");
const express = require("express");
const connectToDB = require("./config/dbConnection");
require("dotenv").config();
const cloudinary = require("cloudinary");

// connect with database
connectToDB();

// cloudinary config goes here
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

app.listen(process.env.PORT, () =>
  console.log(`Server is up and running at port no ${process.env.PORT}`)
);
