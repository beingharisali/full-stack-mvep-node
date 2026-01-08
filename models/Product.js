const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price must be a positive number'],
        validate: {
            validator: function(price) {
                const priceStr = price.toString();
                const decimalParts = priceStr.split('.');
                if (decimalParts.length > 1) {
                    return decimalParts[1].length <= 2;
                }
                return true;
            },
            message: 'Price can have maximum 2 decimal places'
        }
    },
    stock: {
        type: Number,
        required: [true, 'Product stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    images: {
        type: [String],
        validate: {
            validator: function(imageArray) {
                if (!imageArray) return true;
                
                for (const imageUrl of imageArray) {
                    if (typeof imageUrl !== 'string') return false;
                    if (!/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(imageUrl)) {
                        return false;
                    }
                }
                return true;
            },
            message: 'Each image must be a valid image URL with supported extension (jpg, jpeg, png, gif, webp, bmp)'
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Product description cannot exceed 1000 characters'],
        validate: {
            validator: function(description) {
                if (!description) return true; 
                const specialCharCount = (description.match(/[<>{}\[\]|;~`]/g) || []).length;
                return specialCharCount < 5; 
            },
            message: 'Description contains too many special characters'
        }
    },
    category: {
        type: String,
        trim: true,
        maxlength: [100, 'Category name cannot exceed 100 characters'],
        validate: {
            validator: function(category) {
                if (!category) return true; 
                return /^[a-zA-Z0-9\s\-]+$/.test(category);
            },
            message: 'Category name can only contain letters, numbers, spaces, and hyphens'
        }
    },
    brand: {
        type: String,
        trim: true,
        maxlength: [100, 'Brand name cannot exceed 100 characters'],
        validate: {
            validator: function(brand) {
                if (!brand) return true; 
                return /^[a-zA-Z0-9\s\-&]+$/.test(brand);
            },
            message: 'Brand name can only contain letters, numbers, spaces, hyphens, and ampersands'
        }
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