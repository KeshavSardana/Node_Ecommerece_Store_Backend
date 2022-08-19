const express = require("express");
require("dotenv").config();
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

// swagger docs middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// regular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookieParser and fileupload middlewares
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// temp check ejs configuration for testing out images upload
app.set("view engine", "ejs");

// morgan middlewares : morgan is a logger package which logs every incoming request
app.use(morgan("tiny"));

// imports all the routes
const home = require("./routes/home");
const user = require("./routes/user");
// const product = require("./routes/product");

// you need to use middleware while using express router.
app.use("/api/v1", home);
app.use("/api/v1", user);
// app.use("/api/v1", product);

// test route for ejs file uploading situation
app.get("/signuptest", (req, res) => {
  res.render("postform");
});

// export app js
module.exports = app;
