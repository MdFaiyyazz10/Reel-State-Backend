import mongoose from "mongoose";
import validator from "validator"; // Import validator

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: [true, "Email already exists"],
        validate: validator.isEmail
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [8, "Password must be at least 8 characters long"],
    }, 
   
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
    role: {
        type: String,
        default: "user"
    }
} , {timestamps: true});

export const User = mongoose.model("User", userSchema);


