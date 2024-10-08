import mongoose from 'mongoose'
import validator from 'validator'


const messageSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        minLength: [4 , "Enter atleast 4 character"],
    },
    phoneNumber: {
        type: Number,
        require: true,
        minLength: [10 , "Enter 10 digit Number"],
        maxLength: [10 , "Enter 10 digit Number"],
    },
    email: {
        type: String,
        require: true,
        validate: validator.isEmail,
    },
    message: {
        type: String,
        require: true,
        minLength: [10 , "Enter  message at least 10 letters"],
    }

});

export const Message = mongoose.model("Message" , messageSchema); 