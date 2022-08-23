const BigPromise = require("../middlewares/bigPromise");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

exports.sendStripeKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    StripeKey: process.env.STRIPE_API_KEY,
  });
});

exports.captureStripePayment = BigPromise(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",

    // optional
    metadata: { integration_check: "accept_a_payment" },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
    amount: req.body.amount,

    // you can optionally send the id aswell
  });

  // this is what i have seen in docs myself how to do it maybe docs have changed quite possible

  //   const session = await stripe.checkout.sessions.create({
  //     line_items: [
  //       {
  //         price_data: {
  //           currency: "inr",
  //           product_data: {
  //             name: "T-shirt",
  //           },
  //           unit_amount: req.body.amount,
  //         },
  //         quantity: 1,
  //       },
  //     ],
  //     mode: "payment",
  //     success_url: "https://example.com/success",
  //     cancel_url: "https://example.com/cancel",
  //   });

  //   res.redirect(303, session.url);
});

exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
  res.status(200).json({
    razorpayKey: process.env.RAZORPAY_API_KEY,
  });
});

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
  var instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  const options = {
    amount: req.body.amount * 1000,
    currency: "INR",
    receipt:
      "genarate a radom string here via uuid package or nanoid package or just use crypto.random",
  };

  const myOrder = await instance.orders.create(options);

  res.status(200).json({
    success: true,
    amount: req.body.amount,
    myOrder,
  });
});
