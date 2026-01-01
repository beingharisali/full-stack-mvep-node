const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please provide first name'],
        maxlength: 50,
        minlength: 2,
    },
    lastName: {
        type: String,
        required: [true, 'Please provide last name'],
        maxlength: 50,
        minlength: 2,
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6
    },
     role:{
        type:String,
        enum: ['admin', 'vendor', 'customer'],
        default: 'customer'
    },
    profile: {
        businessName: { type: String },
        businessAddress: { type: String },
        businessPhone: { type: String },
        businessLicense: { type: String },
        permissions: [{ type: String }],
        phone: { type: String },
        address: { type: String },
        avatar: { type: String },
        dateOfBirth: { type: Date },
        isActive: { type: Boolean, default: true }
    }
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