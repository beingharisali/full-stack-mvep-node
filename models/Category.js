const mongoose = require("mongoose")
const categorySchema = new mongoose.Schema({
  name:{
    type: Strirng,
    required: true,
    unique: true,
    trim: true,
    maxlength: 32
  },
  description: {
      type: String,
      maxlength: 2000
  }
}, { timestamps: true});
module.exports = mongoose.model("Category", categorySchema);