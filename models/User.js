const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please provide first name'],
    },
    lastName: {
        type: String,
        required: [true, 'Please provide last name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide password']
    },
     role:{
        type:String,
        enum: ['admin', 'vendor', 'customer'],
        default: 'customer'
    },
    
},{
    timestamps:true
})

UserSchema.pre("save", async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.createJWT = function () {
    return jwt.sign(
        {
            userId: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            role: this.role,
            profile: this.profile
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME }
    )
}

UserSchema.methods.isAdmin = function () {
    return this.role === 'admin';
};

UserSchema.methods.isVendor = function () {
    return this.role === 'vendor';
};

UserSchema.methods.isCustomer = function () {
    return this.role === 'customer';
};

UserSchema.methods.hasPermission = function (permission) {
    if (this.role === 'admin' && this.profile && this.profile.permissions) {
        return this.profile.permissions.includes(permission);
    }
    return false;
};


UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}
module.exports = mongoose.model('User', UserSchema)