const express = require("express");
const router = express.Router();

const { getMessagesController } = require("../controller/MessagesController");

router.get("/messages/:recipientUserId", getMessagesController);

module.exports = router;
