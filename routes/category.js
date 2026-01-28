const express = require("express");
const router = express.Router();
const { createCategory } = require("../controllers/category")

router.post("/category", createCategory);

module.exports = router;