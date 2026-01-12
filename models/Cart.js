const mongoose = require ('mongoose');
const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true
    },
    quntity: {
        type: Number,
        required: true,
        default: 1
    }
});
const CartSchema = new mongoose.Schema({
    user:{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        unique: true
    },
    items: [CartItemSchema]
},{ timestamps: true});
module.exports = mongoose.model("Cart", CartSchema);