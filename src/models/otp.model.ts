import mongoose from 'mongoose';
const { Schema } = mongoose;

const otpSchema = new Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    purpose: {
        type: String,
        enum: ['signup', 'login', 'reset-password'],
        required: true,
    },
    createdAt: { type: Date, default: Date.now, expires: 300 }
});

export const Otp = mongoose.model('Otp', otpSchema, 'otps');