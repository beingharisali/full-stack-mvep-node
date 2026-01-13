const mongoose = require('mongoose');

// Cart Item Schema
const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: [true, "Product is required"]
    },
    quantity: { // typo fix
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity cannot be less than 1"],
        default: 1
    }
});

// Cart Schema
const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "User is required"],
        unique: true
    },
    items: [CartItemSchema] // <- empty array allowed now
}, { timestamps: true });

// Export model
module.exports = mongoose.model("Cart", CartSchema);
