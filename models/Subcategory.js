const mongoose = require("mongoose");
const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,

    }
}, { timestamps: true }
)

module.exports = mongoose.model("SubCategory", subCategorySchema);
