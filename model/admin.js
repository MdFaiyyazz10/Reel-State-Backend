import mongoose from "mongoose";
import validator from "validator";

const adminSchema = mongoose.Schema({
    
    email: {
        type: String,
        required: [true , "Please enter a E-mail"],
        unique: [true , "Email already exist"],
        validate: validator.isEmail
    },
    password: {
        type: String,
        required: [true , "Please enter a password"],
        minength: [8 , "Password must be at least 8 character"],
    } , 
    role: {
        type: String,
        default: "admin"
    } , 
} , {timestamps: true})

export const Admin = mongoose.model("Admin" , adminSchema)