const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

// GET users (vendor / customer)
const getAllUsers = async (req, res) => {
  const { role } = req.query;

  const filter = role ? { role } : {};

  const users = await User.find(filter).select("-password");

  res.status(StatusCodes.OK).json(users);
};

// DELETE user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  await User.findByIdAndDelete(id);

  res.status(StatusCodes.OK).json({ msg: "User deleted successfully" });
};

module.exports = {
  getAllUsers,
  deleteUser,
};
