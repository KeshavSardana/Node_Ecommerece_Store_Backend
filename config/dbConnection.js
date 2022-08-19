const mongoose = require("mongoose");

const connectToDB = async () => {
  await mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB Connected Successfully !!"))
    .catch((err) => {
      console.log("DB Connection Failed");
      console.log(err);
      process.exit(1);
    });
};

module.exports = connectToDB;
