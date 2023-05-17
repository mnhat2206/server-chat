const UserModel = require("../model/User");

const getUsers = async (req, res) => {
  const userList = await UserModel.find();
  res.json({ data: userList });
};

module.exports = { getUsers };
