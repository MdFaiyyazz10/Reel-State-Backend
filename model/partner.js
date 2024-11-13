import mongoose from "mongoose";
import validator from "validator";




const partnerSchema = new mongoose.Schema({
    sponsorId: {
        type: String,
        required: [true, "Please enter a sponsor id"],
        unique: [true, "Sponsor id must be unique"],
    },
   
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: [true, "Email already exists"],
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [8, "Password must be at least 8 characters long"],
        validate: {
            validator: function (value) {
                return /[A-Z]/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value);
            },
            message: "Password must contain at least one uppercase letter and one special character"
        }
    },
    phoneNumber: {
        type: String
    },
    role: {
        type: String,
        enum: ["partner"],
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
            message: "Please enter a valid PAN card number"
        }
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    referredBy: [ 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: ['Agent', 'Admin'],  
        }
    ],
}, { timestamps: true });

export const Partner = mongoose.model("Partner", partnerSchema);
