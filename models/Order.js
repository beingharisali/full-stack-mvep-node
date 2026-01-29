const mongoose = require("mongoose")
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
})
const orderSchema = new mongoose.Schema({
   user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true
   },
   items:[orderItemSchema],
   totalAmount: {
    type: Number,
    required: true
   },
   status: {
    type: String,
    enum: ["pending", "paid", "shipped", "delivered"],
    default: "pending"
   }
}, { timestamps: true })
orderSchema.index({ createdAt: 1 });
orderSchema.index({ "items.product": 1 });
orderSchema.index({ user: 1 });
module.exports = mongoose.model("Order", orderSchema)