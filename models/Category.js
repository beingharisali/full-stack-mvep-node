const mongoose = require("mongoose")
const categorySchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
    unique: true,
  },
  description: {
      type: String,
      maxlength: 2000
  }
}, { timestamps: true});
module.exports = mongoose.model("Category", categorySchema);