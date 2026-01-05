const express = require('express')
const router = express.Router()
const { register, login } = require('../controllers/auth')
const auth = require('../middleware/authentication')
const authorize = require('../middleware/authorize')


router.post("/register", register)
router.post("/login", login)
// Only logged in users
router.get("/profile", auth, (req, res) => {
  res.json({
    msg: "Welcome user",
    user: req.user
  });
});

// Only admin
router.get("/admin", auth, authorize("admin"), (req, res) => {
  res.json({ msg: "Welcome Admin" });
});

// Only vendor
router.get("/vendor", auth, authorize("vendor"), (req, res) => {
  res.json({ msg: "Welcome Vendor" });
});

// Only customer
router.get("/customer", auth, authorize("customer"), (req, res) => {
  res.json({ msg: "Welcome Customer" });
});
module.exports = router