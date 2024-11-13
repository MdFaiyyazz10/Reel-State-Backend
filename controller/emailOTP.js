import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Agent } from '../model/user.js';  
import { Partner } from '../model/partner.js';  
import { sendOtpEmail } from '../utils/emailServices.js';  


export const requestForgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        let user = await Agent.findOne({ email });

        if (!user) {
           
            user = await Partner.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000;

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOtpEmail(email, otp);
        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting password reset', error });
    }
};


export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        let user = await Agent.findOne({ email });

        if (!user) {
           
            user = await Partner.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        res.status(200).json({ message: 'OTP verified, you can reset your password', userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { userId, newPassword, confirmPassword } = req.body;

        if (!userId || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        let user = await Agent.findById(userId);

        if (!user) {
            
            user = await Partner.findById(userId);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error });
    }
};


export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        let user = await Agent.findOne({ email });

        if (!user) {
           
            user = await Partner.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000;

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOtpEmail(email, otp);
        res.status(200).json({ message: 'New OTP sent to email' });
    } catch (error) {
        res.status(500).json({ message: 'Error resending OTP', error });
    }
};
