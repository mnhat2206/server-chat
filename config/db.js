const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { dbName: "mern-chat" });
    console.log("Connect Mongo database successfully");
  } catch (error) {
    console.log("[ERROR]", error);
  }
};

module.exports = connectDB;
