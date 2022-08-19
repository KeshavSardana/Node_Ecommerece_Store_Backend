const BigPromise = require("../middlewares/bigPromise");

exports.home = BigPromise(async (req, res) => {
  // const db = await something()
  res.status(200).json({
    success: true,
    greetings: "Hello from the API",
  });
});

exports.dummyHome = (req, res) => {
  res
    .status(200)
    .send("This is another dummy route just to check the initial setup");
};
