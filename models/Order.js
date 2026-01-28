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
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
   }
}, { timestamps: true });
   },
   statusHistory: [statusHistorySchema]
}, {timestamps: true});

module.exports = mongoose.model("Order", orderSchema)