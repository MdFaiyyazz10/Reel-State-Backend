import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const agentSchema = new mongoose.Schema({
    sponsorId: {
        type: String,
        required: [true, "Please enter a sponsor id"],
        unique: [true, "Sponsor id must be unique"],
    },
    referralLink: { // New field for referral link
        type: String,
        required: false,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: [true, "Email already exists"],
        validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [8, "Password must be at least 8 characters long"],
        validate: {
            validator: function (value) {
                return /[A-Z]/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value);
            },
            message: "Password must contain at least one uppercase letter and one special character",
        },
    },
    phoneNumber: {
        type: String,
    },
    role: {
        type: String,
        enum: ["agent", "partner"],
        required: [true, "Please select a role"],
    },
    aadhaarNumber: {
        type: String,
        required: [true, "Please enter your Aadhaar number"],
        unique: true,
        minlength: [12, "Aadhaar number must be 12 digits long"],
        maxlength: [12, "Aadhaar number must be 12 digits long"],
    },
    panCard: {
        type: String,
        required: [true, "Please enter your PAN card number"],
        unique: true,
        minlength: [10, "PAN card number must be 10 characters long"],
        maxlength: [10, "PAN card number must be 10 characters long"],
        validate: {
            validator: function (value) {
                return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
            },
            message: "Please enter a valid PAN card number",
        },
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    referredUsers: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Agent",
            },
            registeredAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],

    // KYC 
    dob: {
        type: Date,
        default: null,
    },
    country: {
        type: String,
        default: null,
    },
    state: {
        type: String,
        default: null,
    },
    city: {
        type: String,
        default: null,
    },

    // Bank Details
    bankName: {
        type: String,
        default: null,
    },
    accountHolderName: {
        type: String,
        default: null,
    },
    accountNumber: {
        type: String,
        default: null,
    },
    ifsc: {
        type: String,
        default: null,
    },
    branch: {
        type: String,
        default: null,
    },

    // Profile Images and Documents
    profileImage: {
        type: String,
        default: null,
    },
    panPhoto: {
        type: String,
        default: null,
    },
    aadhaarPhoto: {
        type: String,
        default: null,
    },
    cancelledCheque: {
        type: String,
        default: null,
    },

    // New Gender Field
    gender: {
        type: String,
        enum: ['male', 'female'], // Only allow 'male' or 'female'
        // required: [true, 'Please select a gender'],
    },
}, { timestamps: true });

// Generate a referral link using sponsorId
agentSchema.pre('save', function (next) {
    if (this.isNew) {
        this.referralLink = `http://localhost:5173/user/login?referral=${this.sponsorId}`;
    }
    next();
});

export const Agent = mongoose.model("Agent", agentSchema);
