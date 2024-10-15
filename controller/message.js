import {Message} from '../model/message.js'


export const sendMessage = async (req, res, next) => {
    try {
        const { name, phoneNumber, email, message } = req.body;

        if (!name || !phoneNumber || !email || !message) {
            return res.status(400).json({ success: false, message: "Please fill all the fields" });
        }

        const messageSent = await Message.create({ name, phoneNumber, email, message });

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: messageSent,
        });
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages[0] || "Validation error occurred",
            });
        }

        // Handle other errors
        return res.status(500).json({
            success: false,
            message: "An error occurred while sending the message",
            error: error.message,
        });
    }
};


export const getAllMessage = async (req, res, next) => {
    try {
        const allMessage = await Message.find();
        return res.status(200).json({ success: true, message: "All messages retrieved successfully", allMessage });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the messages",
            error: error.message,
        });
    }
};
