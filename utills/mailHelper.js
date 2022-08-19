const nodemailer = require("nodemailer");

const mailHelper = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    ssl: false,
    tls: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: "keshavsardana28@gmail.com", // sender address
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // send mail with defined transport object
  await transporter.sendMail(message);
};

module.exports = mailHelper;
