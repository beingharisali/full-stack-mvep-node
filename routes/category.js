const express = require("express");
const router = express.Router();
const { createCategory, createSubCategory } = require("../controllers/category")

router.post("/category", createCategory);
router.post("/subcategory", createSubCategory);
module.exports = router;