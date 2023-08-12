const mongoose = require('mongoose');

const userOTPSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    otp: {
        type: String,
        required: true
    },
    tries: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('UserOTP', userOTPSchema);