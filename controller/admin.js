import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Admin } from '../model/admin.js';
import { Agent } from '../model/user.js';
import { generateSponsorId } from '../utils/sponsorId.js';

export const signUp = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                errorCode: "MISSING_FIELDS",
                message: "Please fill all fields",
            });
        }
        

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const prevUser = await Admin.findOne({ email });
        

        if (prevUser) {
            return res.status(400).json({ success: false, message: "Admin Already Exists" });
        }

        const hashedPassword = bcryptjs.hashSync(password, 10);
        const sponsorId = await generateSponsorId(Admin);  // Passing Admin model to generate a unique sponsor ID
        const referralLink = `http://localhost:5173/login?sponsor=${sponsorId}`;

        const admin = await Admin.create({ email, password: hashedPassword, sponsorId, referralLink });

        return res.status(200).json({
            success: true,
            message: "Admin Registered Successfully",
            admin,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Admin Sign In
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                errorCode: "MISSING_FIELDS",
                message: "Please fill all fields",
            });
        }
        

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ success: false, message: "Admin Not Found" });
        }

        const validPassword = bcryptjs.compareSync(password, admin.password);

        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

        const expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return res.status(200).cookie("admin_token", token, {
            httpOnly: true,
            expires: expireDate
        }).json({ success: true, message: "Logged In Successfully", admin, token });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Admin Logout
export const logout = (req, res) => {
    try {
        
        return res.status(200).cookie("admin_token", "", {
            httpOnly: true,
            expires: new Date(0), // Set the cookie to expire immediately
        }).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getReferredUsers = async (req, res) => {
    try {
        const adminId = req.admin._id;
        const admin = await Admin.findById(adminId).populate('referredUsers.userId');

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        let allReferredUsers = [...admin.referredUsers];

        for (const referredUser of admin.referredUsers) {
            const user = referredUser.userId;
            const userWithIndirectReferrals = await Agent.findById(user._id).populate('referredUsers.userId');

            if (userWithIndirectReferrals) {
                allReferredUsers = [
                    ...allReferredUsers,
                    ...userWithIndirectReferrals.referredUsers.map(indirectRef => ({
                        ...indirectRef,
                        user: indirectRef.userId
                    }))
                ];
            }
        }

        return res.status(200).json({
            success: true,
            referredUsers: allReferredUsers,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

