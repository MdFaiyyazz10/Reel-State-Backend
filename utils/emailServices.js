// utils/emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', // or any other email service you use
    port: 587, 
    host: "smtp.gmail.com",
     
    auth: {
        // user: process.env.EMAIL_USER, // Your email address
        user: "mdfaiyyazz397@gmail.com", // Your email address
        // pass: process.env.APP_PASS, // Your email password or app password
        pass: "fffv mlpx kjdv rnud", // Your email password or app password
    }
});

export const sendOtpEmail = async (to, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // sender address
        to: to, // list of receivers
        subject: 'Your OTP Code', // Subject line
        text: ` Your OTP code is ${otp}` // plain text body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
};
