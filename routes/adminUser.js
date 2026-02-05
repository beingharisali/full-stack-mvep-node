const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication");
const authorize = require("../middleware/authrize");

const {
  getAllUsers,
  deleteUser,
} = require("../controllers/adminUser");

// admin  get users
router.get(
  "/users",
  auth,
  authorize("admin"),
  getAllUsers
);

// admin  delete user
router.delete(
  "/users/:id",
  auth,
  authorize("admin"),
  deleteUser
);

module.exports = router;
