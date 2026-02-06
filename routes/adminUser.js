const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication");
const authorize = require("../middleware/authrize");

const {
  getAllUsers,
  deleteUser,
} = require("../controllers/adminUser");

router.get(
  "/users",
  auth,
  authorize("admin"),
  getAllUsers
);

router.delete(
  "/users/:id",
  auth,
  authorize("admin"),
  deleteUser
);

module.exports = router;
