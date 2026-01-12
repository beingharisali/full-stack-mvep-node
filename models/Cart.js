const mongoose = require ('mongoose');
const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: [true, "Product is required"]
    },
    quntity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity can not be less than 1"],
       default: 1
    }
}); 
const CartSchema = new mongoose.Schema({
    user:{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [ true, "user is required"],
        unique: true
    },
    items: {
 type: [CartItemSchema],
 validate: [ arr => arr.length > 0, "cart cannot be empty"]
}
}, { timestamps: true});
module.exports = mongoose.model("Cart", CartSchema);