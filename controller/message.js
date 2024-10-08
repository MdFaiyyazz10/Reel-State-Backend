import {Message} from '../model/message.js'


export const sendMessage = async (req,res,next) => {

    try {
        const {name , phoneNumber , email , message} = req.body;

        if(!name || !phoneNumber || !email || !message) return res.status(500).json({success: false , message: "Please fill all the fields"});

        
        const messageSent = await Message.create({ name, phoneNumber, email, message });

    
        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: messageSent
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while sending the message",
            error: error.message
        });
    }
  
}

export const getAllMessage = async(req,res,next) => {
    try {
        const allMessage = await Message.find();
        return res.status(200).json({success: true , message: "All message retrieved successfully" , allMessage});
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while sending the message",
            error: error.message
        });
    }
}
