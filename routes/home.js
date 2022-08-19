const express = require("express");
const router = express.Router();
const { home, dummyHome } = require("../controllers/homeController");

router.route("/").get(home);
router.route("/dummy").get(dummyHome);

module.exports = router;
