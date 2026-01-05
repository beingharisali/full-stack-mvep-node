const User = require("../models/User");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const { StatusCodes } = require("http-status-codes");

/**
 * REGISTER
 */
const register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  const userAlreadyExists = await User.findOne({ email });
  if (userAlreadyExists) {
    throw new BadRequestError("Email already in use");
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role, // admin | vendor | customer
  });

  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    token,
  });
};

/**
 * LOGIN
 */
const login = async (req, res) => {
 

  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Email");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Paswsword");
  }

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    token,
  });
};

module.exports = { register, login };
