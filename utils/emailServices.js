// utils/emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    port: 587, 
    host: "smtp.gmail.com",
     
    auth: {
      
        user: "mdfaiyyazz397@gmail.com", 
       
        pass: "fffv mlpx kjdv rnud", 
    }
});

export const sendOtpEmail = async (to, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: to, 
        subject: 'Your OTP Code', 
        text: ` Your OTP code is ${otp}` 
    };

    try {
        await transporter.sendMail(mailOptions);
       
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
};
