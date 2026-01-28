const mongoose = require("mongoose")
const Category = require("../models/Category")
const Subcategory = require("../models/Subcategory")

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.create({
            name,
            description
        });
        res.status(201).json({success:true, category})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const createSubCategory = async (req, res) => {
    try {
    const { name, category } = req.body;

    
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        error: "Invalid category ID"
      });
    }

   
    const sub = await Subcategory.create({
      name,
      category
    });

    res.status(201).json({
      success: true,
      sub
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
    }
}
module.exports = { createCategory, createSubCategory }