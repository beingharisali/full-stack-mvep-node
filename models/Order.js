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

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"]
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

const shippingAddressSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
});

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
   shippingAddress: {
    type: shippingAddressSchema,
    required: true
   },
   paymentMethod: {
    type: String,
    enum: ["card", "stripe", "braintree", "paypal", "cash-on-delivery"],
    default: "card"
   },
   transactionId: {
    type: String
   },
   paymentMetadata: {
    type: Map,
    of: String
   },
   status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
   },
   statusHistory: [statusHistorySchema]
}, { timestamps: true });

orderSchema.index({ createdAt: 1 });
orderSchema.index({ "items.product": 1 });
orderSchema.index({ user: 1 });

module.exports = mongoose.model("Order", orderSchema)