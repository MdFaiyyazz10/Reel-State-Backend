import mongoose from "mongoose";
import validator from "validator";

const adminSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Please enter an email"],
            unique: [true, "Email already exists"],
            validate: validator.isEmail,
        },
        password: {
            type: String,
            required: [true, "Please enter a password"],
            minlength: [8, "Password must be at least 8 characters"],
        },
        role: {
            type: String,
            default: "admin",
        },
        sponsorId: {
            type: String,
            unique: true,
        },
        referralLink: {
            type: String,
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
    },
    { timestamps: true }
);

export const Admin = mongoose.model("Admin", adminSchema);
