const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const getAllUsers = async (req, res) => {
  const { role } = req.query;

  const filter = role ? { role } : {};

  const users = await User.find(filter).select("-password");

  res.status(StatusCodes.OK).json(users);
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (id === req.user.userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        msg: "You cannot delete your own account" 
      });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        msg: "User not found" 
      });
    }

    if (user.role === 'admin' && req.user.userId !== id) {
      return res.status(StatusCodes.FORBIDDEN).json({ 
        msg: "You cannot delete other admin accounts" 
      });
    }

    await User.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({ msg: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Please provide all required fields: firstName, lastName, email, password, and role"
      });
    }
    
    const validRoles = ['vendor', 'customer'];
    if (!validRoles.includes(role)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Role must be either 'vendor' or 'customer'"
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "User with this email already exists"
      });
    }
    
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role
    });
    
    res.status(StatusCodes.CREATED).json({
      msg: "User created successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Email already exists. Please use a different email address.' });
    }
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        msg: "User not found" 
      });
    }
    
    if (id === req.user.userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        msg: "Cannot update your own account through this route" 
      });
    }
    
    if (user.role === 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ 
        msg: "Cannot update admin accounts" 
      });
    }
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (role) {
      const validRoles = ['vendor', 'customer'];
      if (!validRoles.includes(role)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          msg: "Role must be either 'vendor' or 'customer'"
        });
      }
      updateData.role = role;
    }
    
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          msg: "Another user with this email already exists"
        });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
    
    res.status(StatusCodes.OK).json({
      msg: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Email already exists. Please use a different email address.' });
    }
    next(error);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ 
        msg: "User not found" 
      });
    }
    
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Something went wrong" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
