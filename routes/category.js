const express = require("express");
const router = express.Router();
const { createCategory, createSubCategory, getCategories } = require("../controllers/category")

router.post("/category", createCategory);
router.post("/subcategory", createSubCategory);
router.get("/categories", getCategories)
module.exports = router;