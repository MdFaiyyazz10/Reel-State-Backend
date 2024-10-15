import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcryptjs';
import { User } from '../model/user.js';
import { sendOtpEmail } from '../utils/emailServices.js';
import crypto from 'crypto';
import validator from 'validator';

export const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate phoneNumber
        if (phone && !validator.matches(phone, /^\d{10}$/)) {
            return res.status(400).json({ success: false, message: "Invalid phone number format. Must be 10 digits." });
        }

        // Validate password
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create new user
        user = new User({ name, email, phone, password: hashedPassword });
        await user.save();

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message, error });
    }
};

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "User Not Found" });
        }

        const validPassword = bcrypt.compareSync(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        // Generating token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

        const expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return res.status(200).cookie("user_token", token, {
            httpOnly: true,
            expires: expireDate
        }).json({ success: true, message: "Logged In Successfully", user, token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const requestForgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOtpEmail(email, otp);
        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error requesting password reset', error });
    }
};

export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
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
        console.error(error);
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        user.password = hashedPassword;
        user.otp = undefined; // Clear OTP and expiration after resetting
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error resetting password', error });
    }
};


// New resendOtp function
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a new OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOtpEmail(email, otp);
        res.status(200).json({ message: 'New OTP sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error resending OTP', error });
    }
};