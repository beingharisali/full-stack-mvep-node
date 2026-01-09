const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price must be a positive number']
    },
    stock: {
        type: Number,
        required: [true, 'Product stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    images: {
        type: [String]
    },
    description: {
        type: String
    },
    category: {
        type: String
    },
    brand: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

productSchema.index({ name: 'text', description: 'text' }); 
productSchema.index({ category: 1 }); 
productSchema.index({ price: 1 }); 

productSchema.virtual('averageRating').get(function() {
    return this.reviews ? this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length : 0;
});

module.exports = mongoose.model('Product', productSchema);