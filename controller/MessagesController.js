const jwtDecode = require("jwt-decode");

const MessagesModel = require("../model/Messages");

const getMessagesController = async (req, res) => {
  const { recipientUserId } = req.params;
  const bearToken = req.headers.authorization;
  const accessToken = bearToken.split(" ")[1];
  const { userId } = jwtDecode(accessToken);
  const messagesData = await MessagesModel.find({
    sender: { $in: [recipientUserId, userId] },
    recipient: { $in: [recipientUserId, userId] },
  })
    .sort({ createdAt: 1 })
    .select("-__v");
  res.json({ data: messagesData });
};

module.exports = { getMessagesController };
