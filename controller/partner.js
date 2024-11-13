import { Admin } from '../model/admin.js'; 
import { Agent } from '../model/user.js';
import { Partner } from '../model/partner.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import jwt from 'jsonwebtoken'; 
import { generateSponsorId } from '../utils/sponsorId.js';

export const registerPartner = async (req, res) => {
    try {
        const { sponsorId, name, email, phoneNumber, password, aadhaarNumber, panCard, role } = req.body;

        // Only allow 'partner' role
        if (role !== "partner") {
            return res.status(400).json({ success: false, message: "Role must be 'partner'." });
        }

        // Check if the partner already exists
        let partner = await Partner.findOne({ email });
        if (partner) {
            return res.status(400).json({ success: false, message: 'Partner already exists' });
        }

        // Validate phone number format
        if (phoneNumber && !validator.matches(phoneNumber, /^\d{10}$/)) {
            return res.status(400).json({ success: false, message: "Invalid phone number format. Must be 10 digits." });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Generate a new unique sponsorId using the utility function, passing the Partner model
        const newSponsorId = await generateSponsorId(Partner);

        // Create the new partner
        partner = new Partner({
            sponsorId: newSponsorId,  // Assign the unique sponsorId
            name,
            email,
            phoneNumber,
            password: hashedPassword,
            aadhaarNumber,
            panCard,
            role,
        });

        // Check if sponsorId is provided and validate
        if (sponsorId) {
            // Check if the sponsorId belongs to an Admin or Agent
            const adminReferrer = await Admin.findOne({ sponsorId });
            if (adminReferrer) {
                adminReferrer.referredUsers.push({
                    userId: partner._id,
                    registeredAt: new Date(),
                });
                await adminReferrer.save();
            } else {
                const agentReferrer = await Agent.findOne({ sponsorId });
                if (agentReferrer) {
                    agentReferrer.referredUsers.push({
                        userId: partner._id,
                        registeredAt: new Date(),
                    });
                    await agentReferrer.save();
                } else {
                    return res.status(400).json({ success: false, message: "Invalid sponsorId" });
                }
            }
        }

        // Save the partner
        await partner.save();

        res.status(201).json({
            success: true,
            message: 'Partner registered successfully',
            partner,
            sponsorId: newSponsorId,  // Return the new sponsorId
        });

    } catch (error) {
        console.error("Error in partner registration:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};



export const partnerSignIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        // Query the Partner model, not the Agent model
        const user = await Partner.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Partner Not Found" });
        }

        // Compare the password
        const validPassword = bcrypt.compareSync(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        // Generate the JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

        const expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return res.status(200).cookie("partner_token", token, {
            httpOnly: true,
            expires: expireDate
        }).json({ success: true, message: "Logged In Successfully", user, token });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

