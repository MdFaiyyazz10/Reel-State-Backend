import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Admin } from '../model/admin.js';


export const signUp = async (req, res) => {
    try {
        const { email, password} = req.body;

        if (!email || !password ) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const prevUser = await Admin.findOne({ email });

        if (prevUser) {
            return res.status(400).json({ success: false, message: "Admin Already Exists" });
        }

        const hashedPassword = bcryptjs.hashSync(password, 10);

        const admin = await Admin.create({ email, password: hashedPassword  });

        return res.status(200).json({ success: true, message: "Admin  Successfully"  , admin });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};



export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        const user = await Admin.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Admin Not Found" });
        }

        const validPassword = bcryptjs.compareSync(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

        const expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return res.status(200).cookie("admin_token", token, {
            httpOnly: true,
            expires: expireDate
        }).json({ success: true, message: "Logged In Successfully", user, token });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


export const logout = (req, res) => {
    try {
        // Clear the admin_token cookie
        return res.status(200).cookie("admin_token", "", {
            httpOnly: true,
            expires: new Date(0), // Set the cookie to expire immediately
        }).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
