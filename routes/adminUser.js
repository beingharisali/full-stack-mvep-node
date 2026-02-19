const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication");
const authorize = require("../middleware/authrize");


const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/adminUser");

router.get(
  "/users",
  auth,
  authorize("admin"),
  getAllUsers
);

router.get(
  "/users/:id",
  auth,
  authorize("admin"),
  getUserById
);

router.post(
  "/users",
  auth,
  authorize("admin"),
  createUser
);

router.put(
  "/users/:id",
  auth,
  authorize("admin"),
  updateUser
);

router.delete(
  "/users/:id",
  auth,
  authorize("admin"),
  deleteUser
);

module.exports = router;
