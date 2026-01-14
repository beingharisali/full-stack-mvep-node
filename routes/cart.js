const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");

const {
  addCart,
  removeCart,
  updateCartItem,
  clearCart,
  getCart
} = require("../controllers/cartController");

router.post("/add", authentication, addCart);
router.delete("/remove/:productId", authentication, removeCart);
router.put("/update", authentication, updateCartItem);
router.delete("/delete", authentication, clearCart);
router.get("/get", authentication, getCart);

module.exports = router;
