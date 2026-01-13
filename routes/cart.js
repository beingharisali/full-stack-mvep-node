const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");

const {
  addCart,
  removeCart,
  updateCartItem,
  clearCart
} = require("../controllers/cartController");

router.post("/add", authentication, addCart);
router.delete("/remove/:productId", authentication, removeCart);
router.put("/update", authentication, updateCartItem);
router.delete("/delete", authentication, clearCart);

module.exports = router;
