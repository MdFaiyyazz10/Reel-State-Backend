import jwt from 'jsonwebtoken'; // Add this line
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

        // validate pasword
        if (password.length < 8) {
            return res.status(400).json({success: false , message: "Password must be at least 8 character"})
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create new user
        user = new User({ name, email, phone, password: hashedPassword });
        await user.save();

        res.status(201).json({ success: true ,  message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false ,  message: error.message, error });
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

export const loginUser = async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate OTP and expiration time (5 mins from now)
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Update user with OTP and expiration
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP via email
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in', error });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP is valid and not expired
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // OTP is valid, proceed with login (return user details or a token)
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};




export const requestForgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate OTP and expiration time (5 mins from now)
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Update user with OTP and expiration
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP via email
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

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP is valid and not expired
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // OTP is valid
        res.status(200).json({ message: 'OTP verified, you can reset your password', userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password
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
