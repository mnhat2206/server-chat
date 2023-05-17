const mongoose = require("mongoose");

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    file: String,
  },
  { timestamps: true }
);

const MessagesModel = mongoose.model("Messages", messageSchema);

module.exports = MessagesModel;
