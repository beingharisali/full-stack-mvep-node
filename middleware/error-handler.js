const { StatusCodes } = require("http-status-codes");
const { CustomAPIError } = require("../errors");

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);

  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong, try again later",
  };

  // Custom API Errors (BadRequest, Unauthenticated etc)
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({
      success: false,
      msg: err.message,
    });
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Duplicate Key Error (email already exists)
  if (err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    customError.msg = `No item found with id: ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  return res.status(customError.statusCode).json({
    success: false,
    msg: customError.msg,
  });
};

module.exports = errorHandlerMiddleware;
