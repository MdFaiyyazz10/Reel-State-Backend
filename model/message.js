import mongoose from 'mongoose';
import validator from 'validator';

const messageSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [4, "Enter at least 4 characters"],
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^\d{10}$/, "Enter a valid 10-digit number"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        validate: {
            validator: validator.isEmail,
            message: "Enter a valid email address",
        },
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        minlength: [10, "Enter a message of at least 10 characters"],
        validate: {
            validator: function (v) {
                // Regex to check for URLs, including those without http/https
                return !/(\b(https?|ftp|file):\/\/[^\s/$.?#].[^\s]*|www\.[^\s]+|https?:\/\/[^\s]+)/i.test(v);
            },
            message: "Links are not allowed in the message",
        },
    }
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);
